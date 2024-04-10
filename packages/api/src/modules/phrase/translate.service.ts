import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import OpenAI from 'openai'
import { PrismaService } from 'src/utils/prisma.service'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { HumanRequester } from 'src/utils/requester'
import { Language, Phrase, PhraseTranslation } from '@prisma/client'
import {
  TranslateClient,
  TranslateTextCommand,
} from '@aws-sdk/client-translate'
import { UsageLogger } from 'src/utils/usage-logger'

interface TranslatePhraseParams {
  phraseId: string
  languageId: string
  requester: HumanRequester
}

interface TranslateWithProviderParams {
  phrase: Phrase & {
    translations: Array<PhraseTranslation & { language: Language }>
  }
  targetLanguage: Language
}

@Injectable()
export class TranslateService {
  private usageLogger = new UsageLogger()

  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Config, true>,
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
  }: TranslateWithProviderParams) {
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
      apiKey: this.configService.get('openAIKey', {
        infer: true,
      }),
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

    this.usageLogger.log({
      metric: 'openai_token',
      quantity: chatCompletion.usage?.total_tokens ?? 0,
      id: chatCompletion.id,
      workspaceId: phrase.workspaceId,
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
  }: TranslateWithProviderParams) {
    /**
     * AWS Translate is not supported by LocalStack
     * in development environment
     */
    if (process.env.AWS_CUSTOM_ENDPOINT) {
      return 'Auto translation'
    }

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

    const client = new TranslateClient({
      region: 'us-east-1',
      endpoint: 'https://translate.us-east-1.amazonaws.com',
    })

    const result = await client
      .send(
        new TranslateTextCommand({
          SourceLanguageCode: sourceLocale,
          TargetLanguageCode: targetLocale,
          Text: sourceTranslation.content,
        }),
      )
      .catch(() => null)

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

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('Requester cannot access workspace')
    }

    if (!requester.canAccessWorkspace(targetLanguage.workspaceId)) {
      throw new ForbiddenException('Requester cannot access workspace')
    }

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
        })
        break
      case 'openai':
        translation = await this.translateWithOpenAI({
          phrase,
          targetLanguage,
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
          createdBy: requester.getAccountIDForWorkspace(phrase.workspaceId)!,
        },
        update: {
          content: translation,
          updatedBy: requester.getAccountIDForWorkspace(phrase.workspaceId)!,
        },
      }),
      this.prismaService.phrase.update({
        where: { id: phraseId },
        include: {
          translations: true,
        },
        data: {
          updatedAt: new Date(),
          updatedBy: requester.getAccountIDForWorkspace(phrase.workspaceId)!,
        },
      }),
    ])

    return updatedPhrase
  }
}
