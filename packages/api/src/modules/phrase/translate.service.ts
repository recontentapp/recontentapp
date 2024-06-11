import {
  TranslateClient,
  TranslateTextCommand,
} from '@aws-sdk/client-translate'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Language, Phrase, PhraseTranslation } from '@prisma/client'
import OpenAI from 'openai'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester, WorkspaceAccess } from '../auth/requester.object'
import { MeteredService } from '../cloud/billing/metered.service'
import { LanguageLocale, getISO639LabelFromLocale } from '../workspace/locale'

interface TranslatePhraseParams {
  phraseId: string
  languageId: string
  requester: Requester
}

interface BatchTranslatePhrasesParams {
  revisionId: string
  phraseIds: string[]
  sourceLanguageId: string
  targetLanguageId: string
  requester: Requester
}

interface TranslateWithProviderParams {
  phrase: Phrase & {
    translations: Array<PhraseTranslation & { language: Language }>
  }
  targetLanguage: Language
  workspaceAccess: WorkspaceAccess
}

interface RewritePhraseTranslationParams {
  phraseTranslationId: string
  requester: Requester
  tone: 'formal' | 'informal'
  length: 'shorter' | 'longer' | 'same'
  customInstructions: string[]
}

@Injectable()
export class TranslateService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Config, true>,
    private meteredService: MeteredService,
  ) {}

  private static preferredSourceLocales = ['en', 'zh', 'es', 'fr', 'ar', 'pt']

  /**
   * https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html
   */
  private static awsTranslateSupportedLocales = [
    'af',
    'sq',
    'am',
    'ar',
    'hy',
    'az',
    'bn',
    'bs',
    'bg',
    'ca',
    'zh',
    'zh-TW',
    'hr',
    'cs',
    'da',
    'fa-AF',
    'nl',
    'en',
    'et',
    'fa',
    'tl',
    'fi',
    'fr',
    'fr-CA',
    'ka',
    'de',
    'el',
    'gu',
    'ht',
    'ha',
    'he',
    'hi',
    'hu',
    'is',
    'id',
    'ga',
    'it',
    'ja',
    'kn',
    'kk',
    'ko',
    'lv',
    'lt',
    'mk',
    'ms',
    'ml',
    'mt',
    'mr',
    'mn',
    'no',
    'ps',
    'pl',
    'pt',
    'pt-PT',
    'pa',
    'ro',
    'ru',
    'sr',
    'si',
    'sk',
    'sl',
    'so',
    'es',
    'es-MX',
    'sw',
    'sv',
    'ta',
    'te',
    'th',
    'tr',
    'uk',
    'ur',
    'uz',
    'vi',
    'cy',
  ]

  private findFirstSupportedSourceLocale = (
    translations: Array<PhraseTranslation & { language: Language }>,
    targetLanguage: Language,
  ) => {
    return TranslateService.awsTranslateSupportedLocales.find(locale => {
      return translations.find(
        translation =>
          translation.language.locale === locale &&
          translation.language.locale !== targetLanguage.locale,
      )
    })
  }

  private async translateWithOpenAI({
    phrase,
    targetLanguage,
    workspaceAccess,
  }: TranslateWithProviderParams) {
    const apiKey = this.configService.get('autoTranslate.openAIKey', {
      infer: true,
    })
    if (!apiKey) {
      throw new BadRequestException('OpenAI API key not set')
    }

    const sourceLocale =
      TranslateService.preferredSourceLocales.find(locale => {
        return phrase.translations.find(
          translation =>
            translation.language.locale === locale &&
            translation.language.locale !== targetLanguage.locale,
        )
      }) ??
      phrase.translations.find(
        translation => translation.language.locale !== targetLanguage.locale,
      )?.language.locale
    const sourceTranslation = phrase.translations.find(
      translation => translation.language.locale === sourceLocale,
    )!
    const targetLocale = targetLanguage.locale
    const textToTranslate = sourceTranslation.content

    const client = new OpenAI({
      apiKey,
    })

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            "You're a translation assistant. From a source text & source locale, generate JSON with a single `translation` property in target locale.",
        },
        {
          role: 'user',
          content: `Source locale: '${sourceLocale}'\nTarget locale: '${targetLocale}'\nSource text: '${textToTranslate}'`,
        },
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    const response = chatCompletion.choices.at(0)?.message.content
    if (!response) {
      return null
    }

    this.meteredService.log({
      workspaceId: workspaceAccess.getWorkspaceID(),
      accountId: workspaceAccess.getAccountID(),
      metric: 'token',
      quantity: chatCompletion.usage?.total_tokens ?? 0,
      externalId: chatCompletion.id,
      timestamp: new Date(chatCompletion.created),
    })

    try {
      const { translation } = JSON.parse(response)
      return translation
    } catch (e) {
      return null
    }
  }

  private async translateWithAWSTranslate({
    phrase,
    targetLanguage,
    workspaceAccess,
  }: TranslateWithProviderParams) {
    if (
      TranslateService.awsTranslateSupportedLocales.indexOf(
        targetLanguage.locale,
      ) === -1
    ) {
      throw new BadRequestException('Unsupported target locale')
    }

    const sourceLocale =
      TranslateService.preferredSourceLocales.find(locale => {
        return phrase.translations.find(
          translation =>
            translation.language.locale === locale &&
            translation.language.locale !== targetLanguage.locale,
        )
      }) ??
      this.findFirstSupportedSourceLocale(phrase.translations, targetLanguage)

    if (!sourceLocale) {
      throw new BadRequestException('No supported source translation found')
    }

    const sourceTranslation = phrase.translations.find(
      translation => translation.language.locale === sourceLocale,
    )!
    const targetLocale = targetLanguage.locale

    const client = new TranslateClient()

    const result = await client
      .send(
        new TranslateTextCommand({
          SourceLanguageCode: sourceLocale,
          TargetLanguageCode: targetLocale,
          Text: sourceTranslation.content,
        }),
      )
      .catch(() => null)

    this.meteredService.log({
      workspaceId: workspaceAccess.getWorkspaceID(),
      accountId: workspaceAccess.getAccountID(),
      metric: 'token',
      quantity: sourceTranslation.content.length,
      externalId: result?.$metadata.requestId ?? 'unknown',
      timestamp: new Date(),
    })

    return result?.TranslatedText ?? null
  }

  async translatePhrase({
    phraseId,
    languageId,
    requester,
  }: TranslatePhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    })

    const targetLanguage = await this.prismaService.language.findUniqueOrThrow({
      where: { id: languageId },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      phrase.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('auto_translation:use')

    if (phrase.workspaceId !== targetLanguage.workspaceId) {
      throw new BadRequestException(
        'Phrase and language are in different workspaces',
      )
    }

    const doesNotHaveSourceTranslation = phrase.translations.length === 0
    const onlyTranslationIsTargetLanguage =
      phrase.translations.length === 1 &&
      phrase.translations[0].language.locale === targetLanguage.locale

    if (doesNotHaveSourceTranslation || onlyTranslationIsTargetLanguage) {
      throw new BadRequestException('Phrase has no source translation')
    }

    let translation: string | null = null

    const autoTranslateProvider = this.configService.get(
      'autoTranslate.provider',
      { infer: true },
    )

    switch (autoTranslateProvider) {
      case 'aws':
        translation = await this.translateWithAWSTranslate({
          phrase,
          targetLanguage,
          workspaceAccess,
        })
        break
      case 'openai':
        translation = await this.translateWithOpenAI({
          phrase,
          targetLanguage,
          workspaceAccess,
        })
        break
    }

    if (!translation) {
      throw new BadRequestException('Could not translate phrase')
    }

    const [, updatedPhrase] = await this.prismaService.$transaction([
      this.prismaService.phraseTranslation.upsert({
        where: {
          phraseId_languageId_revisionId: {
            phraseId,
            languageId,
            revisionId: phrase.revisionId,
          },
        },
        create: {
          phraseId,
          languageId,
          revisionId: phrase.revisionId,
          workspaceId: phrase.workspaceId,
          content: translation,
          createdBy: workspaceAccess.getAccountID(),
        },
        update: {
          content: translation,
          updatedBy: workspaceAccess.getAccountID(),
        },
      }),
      this.prismaService.phrase.update({
        where: { id: phraseId },
        include: {
          translations: true,
        },
        data: {
          updatedAt: new Date(),
          updatedBy: workspaceAccess.getAccountID(),
        },
      }),
    ])

    return updatedPhrase
  }

  async batchTranslatePhrases({
    revisionId,
    phraseIds,
    sourceLanguageId,
    targetLanguageId,
    requester,
  }: BatchTranslatePhrasesParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('auto_translation:use')

    const [sourceLanguage, targetLanguage] = await Promise.all([
      this.prismaService.language.findUniqueOrThrow({
        where: { id: sourceLanguageId },
      }),
      this.prismaService.language.findUniqueOrThrow({
        where: { id: targetLanguageId },
      }),
    ])
    if (
      sourceLanguage.workspaceId !== revision.workspaceId ||
      targetLanguage.workspaceId !== revision.workspaceId
    ) {
      throw new BadRequestException('Languages are in different workspace')
    }

    const sourceLanguageISOLabel = getISO639LabelFromLocale(
      sourceLanguage.locale as LanguageLocale,
    )
    const targetLanguageISOLabel = getISO639LabelFromLocale(
      targetLanguage.locale as LanguageLocale,
    )

    const phrases = await this.prismaService.phrase.findMany({
      where: {
        id: { in: phraseIds },
        workspaceId: revision.workspaceId,
      },
      select: {
        id: true,
        key: true,
        translations: {
          where: { languageId: sourceLanguageId },
          select: {
            content: true,
          },
        },
      },
    })

    const phrasesMap = phrases.reduce<
      Record<string, { id: string; translation: string }>
    >((acc, phrase) => {
      const sourceTranslation = phrase.translations[0]
      if (sourceTranslation) {
        acc[phrase.key] = {
          id: phrase.id,
          translation: sourceTranslation.content,
        }
      }
      return acc
    }, {})
    const translationsMap = Object.entries(phrasesMap).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      acc[key] = value.translation
      return acc
    }, {})

    if (Object.keys(phrasesMap).length === 0) {
      throw new BadRequestException('No source translations found')
    }

    const apiKey = this.configService.get('autoTranslate.openAIKey', {
      infer: true,
    })
    if (!apiKey) {
      throw new BadRequestException('OpenAI API key not set')
    }

    const client = new OpenAI({
      apiKey,
    })

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a localization assistant. You will be provided with a JSON object of key/translation pairs in ${sourceLanguageISOLabel}, your task is to translate them to ${targetLanguageISOLabel}.`,
        },
        {
          role: 'user',
          content: JSON.stringify(translationsMap),
        },
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    const response = chatCompletion.choices.at(0)?.message.content
    if (!response) {
      return
    }

    this.meteredService.log({
      workspaceId: workspaceAccess.getWorkspaceID(),
      accountId: workspaceAccess.getAccountID(),
      metric: 'token',
      quantity: chatCompletion.usage?.total_tokens ?? 0,
      externalId: chatCompletion.id,
      timestamp: new Date(chatCompletion.created),
    })

    let content: Record<string, string>

    try {
      content = JSON.parse(response)
    } catch (e) {
      return
    }

    const translationsToInsert = Object.entries(content).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      const phrase = phrasesMap[key]
      if (!phrase) {
        return acc
      }

      acc[phrase.id] = value
      return acc
    }, {})

    await this.prismaService.$transaction([
      this.prismaService.phraseTranslation.createMany({
        data: Object.entries(translationsToInsert).map(
          ([phraseId, content]) => ({
            phraseId,
            languageId: targetLanguageId,
            revisionId,
            workspaceId: revision.workspaceId,
            content,
            createdBy: workspaceAccess.getAccountID(),
          }),
        ),
        skipDuplicates: true,
      }),
      this.prismaService.phrase.updateMany({
        where: { id: { in: Object.keys(translationsToInsert) } },
        data: {
          updatedAt: new Date(),
          updatedBy: workspaceAccess.getAccountID(),
        },
      }),
    ])
  }

  async rewritePhraseTranslation({
    phraseTranslationId,
    requester,
    tone,
    length,
    customInstructions,
  }: RewritePhraseTranslationParams) {
    const phraseTranslation =
      await this.prismaService.phraseTranslation.findUniqueOrThrow({
        where: { id: phraseTranslationId },
        include: {
          language: true,
        },
      })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      phraseTranslation.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('auto_translation:use')

    const apiKey = this.configService.get('autoTranslate.openAIKey', {
      infer: true,
    })
    if (!apiKey) {
      throw new BadRequestException('OpenAI API key not set')
    }

    const client = new OpenAI({
      apiKey,
    })

    const sourceLanguageISOLabel = getISO639LabelFromLocale(
      phraseTranslation.language.locale as LanguageLocale,
    )

    let lengthLabel: string
    switch (length) {
      case 'shorter':
        lengthLabel = 'shorter'
        break
      case 'longer':
        lengthLabel = 'longer'
        break
      case 'same':
        lengthLabel = 'the same length'
        break
    }

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a UX writing assistant. You will be provided with a text in ${sourceLanguageISOLabel}. Your task is to rephrase it while making it ${lengthLabel} using a ${tone} tone. Make sure to also:\n${customInstructions.join('\n')}`,
        },
        {
          role: 'user',
          content: phraseTranslation.content,
        },
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'text' },
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    const response = chatCompletion.choices.at(0)?.message.content
    if (!response) {
      throw new BadRequestException('Could not rewrite phrase translation')
    }

    this.meteredService.log({
      workspaceId: workspaceAccess.getWorkspaceID(),
      accountId: workspaceAccess.getAccountID(),
      metric: 'token',
      quantity: chatCompletion.usage?.total_tokens ?? 0,
      externalId: chatCompletion.id,
      timestamp: new Date(chatCompletion.created),
    })

    return response
  }
}
