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
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Config, true>,
  ) {}

  private static preferredSourceLocales = ['en', 'zh', 'es', 'fr', 'ar', 'pt']

  /**
   * List of supported locales by AWS Translate
   * https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html
   */
  private static supportedLocales = [
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
  ) => {
    return TranslateService.supportedLocales.find(locale => {
      return translations.find(
        translation => translation.language.locale === locale,
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
          translation => translation.language.locale === locale,
        )
      }) ?? phrase.translations[0].language.locale
    const sourceTranslation = phrase.translations.find(
      translation => translation.language.locale === sourceLocale,
    )!
    const targetLocale = targetLanguage.locale
    const textToTranslate = sourceTranslation.content

    const client = new OpenAI({
      apiKey: this.configService.get('ai.openAIKey', { infer: true }),
    })

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a translation assistant which translates a source text from one source locale to a target locale. You always answer in JSON with a single `text` property.',
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

    console.log(chatCompletion.choices[0].message.content)
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
      TranslateService.supportedLocales.indexOf(targetLanguage.locale) === -1
    ) {
      throw new BadRequestException('Unsupported target locale')
    }

    const sourceLocale =
      TranslateService.preferredSourceLocales.find(locale => {
        return phrase.translations.find(
          translation => translation.language.locale === locale,
        )
      }) ?? this.findFirstSupportedSourceLocale(phrase.translations)

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

    if (phrase.translations.length === 0) {
      throw new BadRequestException('Phrase has no source translation')
    }

    const translation = await this.translateWithAWSTranslate({
      phrase,
      targetLanguage,
    })

    if (!translation) {
      throw new BadRequestException('Could not translate phrase')
    }

    await this.prismaService.$transaction([
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
        data: {
          updatedAt: new Date(),
          updatedBy: requester.getAccountIDForWorkspace(phrase.workspaceId)!,
        },
      }),
    ])
  }
}
