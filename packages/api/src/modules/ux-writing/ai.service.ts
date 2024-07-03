import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import { LanguageLocale, getISO639LabelFromLocale } from '../workspace/locale'
import { getBatchTranslatePrompt, getRephrasePrompt } from './config/prompts'
import { GeminiAIProvider } from './config/providers/gemini'
import { AIProvider } from './config/providers/types'

interface BatchTranslateParams {
  translationsMap: Record<string, string>
  sourceLanguage: {
    id: string
    locale: string
  }
  targetLanguage: {
    id: string
    locale: string
  }
  glossaryId?: string
  accountId: string
  workspaceId: string
}

interface RephraseParams {
  content: string
  promptId: string
  accountId: string
  workspaceId: string
}

@Injectable()
export class AIService {
  private aiProvider: AIProvider | null = null

  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Config, true>,
  ) {
    const geminiApiKey = this.configService.get('ai.googleGeminiApiKey', {
      infer: true,
    })
    if (geminiApiKey) {
      this.aiProvider = new GeminiAIProvider(geminiApiKey)
    }
  }

  async batchTranslate({
    translationsMap,
    sourceLanguage,
    targetLanguage,
    glossaryId,
    accountId,
    workspaceId,
  }: BatchTranslateParams) {
    if (!this.aiProvider) {
      throw new BadRequestException('AI provider is not configured')
    }

    let nonTranslatableTerms: string[] = []
    let customTranslations: Record<string, string> = {}

    if (glossaryId) {
      const glossary = await this.prismaService.glossary.findUniqueOrThrow({
        where: { id: glossaryId },
        include: {
          terms: {
            include: {
              translations: {
                where: {
                  languageId: { in: [sourceLanguage.id, targetLanguage.id] },
                },
              },
            },
          },
        },
      })

      nonTranslatableTerms = glossary.terms
        .filter(term => term.nonTranslatable)
        .map(term => term.name)
      customTranslations = glossary.terms
        .filter(term => {
          return term.translations.length === 2
        })
        .reduce<Record<string, string>>((acc, term) => {
          const sourceTranslation = term.translations.find(
            translation => translation.languageId === sourceLanguage.id,
          )
          const targetTranslation = term.translations.find(
            translation => translation.languageId === targetLanguage.id,
          )

          if (!sourceTranslation || !targetTranslation) {
            return acc
          }

          acc[sourceTranslation.content] = targetTranslation.content
          return acc
        }, {})
    }

    const response = await this.aiProvider.process({
      prompt: getBatchTranslatePrompt({
        sourceLanguageLabel: getISO639LabelFromLocale(
          sourceLanguage.locale as LanguageLocale,
        ),
        targetLanguageLabel: getISO639LabelFromLocale(
          targetLanguage.locale as LanguageLocale,
        ),
        nonTranslatableTerms,
        customTranslations,
      }),
      query: JSON.stringify(translationsMap, null, 2),
      resultFormat: 'json',
    })

    await this.prismaService.aIUsageEvent.create({
      data: {
        inputTokensCount: response.usage.inputTokensCount,
        outputTokensCount: response.usage.outputTokensCount,
        accountId,
        workspaceId,
      },
    })

    let result: Record<string, string>

    try {
      result = JSON.parse(response.result)
    } catch (e) {
      throw new BadRequestException('Failed to parse AI response')
    }

    return result
  }

  async rephrase({
    content,
    promptId,
    accountId,
    workspaceId,
  }: RephraseParams) {
    if (!this.aiProvider) {
      throw new BadRequestException('AI provider is not configured')
    }

    const prompt = await this.prismaService.prompt.findUniqueOrThrow({
      where: { id: promptId },
      include: {
        glossary: {
          include: {
            terms: true,
          },
        },
      },
    })

    const forbiddenTerms = prompt.glossary?.terms
      .filter(term => term.forbidden)
      .map(term => term.name)

    const response = await this.aiProvider.process({
      prompt: getRephrasePrompt({
        forbiddenTerms,
        customInstructions: prompt.customInstructions,
      }),
      query: content,
      resultFormat: 'text',
    })

    await this.prismaService.aIUsageEvent.create({
      data: {
        inputTokensCount: response.usage.inputTokensCount,
        outputTokensCount: response.usage.outputTokensCount,
        accountId,
        workspaceId,
      },
    })

    return response.result
  }
}
