import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GlossaryTerm, Prompt } from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'
import { Config } from 'src/utils/config'
import { PrismaService } from 'src/utils/prisma.service'
import { LanguageLocale, getISO639LabelFromLocale } from '../workspace/locale'
import {
  getBatchTranslatePrompt,
  getRephrasePrompt,
  getTranslatePrompt,
} from './config/prompts'
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

interface TranslateParams {
  content: string
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

interface RewriteParams {
  content: string
  prompt: (Prompt & { glossary: { terms: GlossaryTerm[] } | null }) | null
  defaultPromptTone: Components.Schemas.PromptTone | null
  accountId: string
  workspaceId: string
  sourceLanguage: {
    id: string
    locale: string
  }
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

  private async getCustomTranslationsAndNonTranslatableTerms(
    glossaryId: string | undefined,
    sourceLanguageId: string,
    targetLanguageId: string,
  ) {
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
                  languageId: { in: [sourceLanguageId, targetLanguageId] },
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
            translation => translation.languageId === sourceLanguageId,
          )
          const targetTranslation = term.translations.find(
            translation => translation.languageId === targetLanguageId,
          )

          if (!sourceTranslation || !targetTranslation) {
            return acc
          }

          acc[sourceTranslation.content] = targetTranslation.content
          return acc
        }, {})
    }

    return { nonTranslatableTerms, customTranslations }
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

    const { nonTranslatableTerms, customTranslations } =
      await this.getCustomTranslationsAndNonTranslatableTerms(
        glossaryId,
        sourceLanguage.id,
        targetLanguage.id,
      )

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
      mode: 'strict',
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

  async translate({
    content,
    sourceLanguage,
    targetLanguage,
    glossaryId,
    accountId,
    workspaceId,
  }: TranslateParams) {
    if (!this.aiProvider) {
      throw new BadRequestException('AI provider is not configured')
    }

    const { nonTranslatableTerms, customTranslations } =
      await this.getCustomTranslationsAndNonTranslatableTerms(
        glossaryId,
        sourceLanguage.id,
        targetLanguage.id,
      )

    const response = await this.aiProvider.process({
      prompt: getTranslatePrompt({
        sourceLanguageLabel: getISO639LabelFromLocale(
          sourceLanguage.locale as LanguageLocale,
        ),
        targetLanguageLabel: getISO639LabelFromLocale(
          targetLanguage.locale as LanguageLocale,
        ),
        nonTranslatableTerms,
        customTranslations,
      }),
      query: content,
      resultFormat: 'text',
      mode: 'strict',
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

  async rewrite({
    content,
    prompt,
    defaultPromptTone,
    accountId,
    workspaceId,
    sourceLanguage,
  }: RewriteParams) {
    if (!this.aiProvider) {
      throw new BadRequestException('AI provider is not configured')
    }

    let aiPrompt: string | null = null

    if (prompt) {
      const forbiddenTerms = prompt.glossary?.terms
        .filter(term => term.forbidden)
        .map(term => term.name)

      aiPrompt = getRephrasePrompt({
        forbiddenTerms,
        customInstructions: prompt.customInstructions,
        tone: prompt.tone as Components.Schemas.PromptTone | null,
        length: prompt.length as Components.Schemas.PromptLength | null,
        sourceLanguageLabel: getISO639LabelFromLocale(
          sourceLanguage.locale as LanguageLocale,
        ),
      })
    }

    if (defaultPromptTone) {
      aiPrompt = getRephrasePrompt({
        forbiddenTerms: [],
        customInstructions: [],
        tone: defaultPromptTone,
        length: 'same',
        sourceLanguageLabel: getISO639LabelFromLocale(
          sourceLanguage.locale as LanguageLocale,
        ),
      })
    }

    if (!aiPrompt) {
      throw new BadRequestException('Could not generate AI prompt')
    }

    const response = await this.aiProvider.process({
      prompt: aiPrompt,
      query: content,
      resultFormat: 'text',
      mode: 'creative',
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
