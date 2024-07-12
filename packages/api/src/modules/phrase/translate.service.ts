import { BadRequestException, Injectable } from '@nestjs/common'
import { GlossaryTerm, Prompt } from '@prisma/client'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester } from '../auth/requester.object'
import { AIService } from '../ux-writing/ai.service'
import { isValidPromptTone } from '../ux-writing/prompt'

interface BatchTranslatePhrasesParams {
  revisionId: string
  phraseIds: string[]
  sourceLanguageId: string
  targetLanguageId: string
  requester: Requester
}

interface TranslateParams {
  content: string
  workspaceId: string
  sourceLanguageId: string
  targetLanguageId: string
  requester: Requester
}

interface RewritePhraseTranslationParams {
  requester: Requester
  sourceLanguageId: string
  content: string
  promptId: string
}

@Injectable()
export class TranslateService {
  constructor(
    private prismaService: PrismaService,
    private aiService: AIService,
  ) {}

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

    const content = await this.aiService.batchTranslate({
      translationsMap,
      sourceLanguage,
      targetLanguage,
      accountId: workspaceAccess.getAccountID(),
      workspaceId: revision.workspaceId,
    })

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

  async translate({
    content,
    workspaceId,
    sourceLanguageId,
    targetLanguageId,
    requester,
  }: TranslateParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
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
      sourceLanguage.workspaceId !== workspaceId ||
      targetLanguage.workspaceId !== workspaceId
    ) {
      throw new BadRequestException('Languages are in different workspace')
    }

    const result = await this.aiService.translate({
      content,
      sourceLanguage,
      targetLanguage,
      accountId: workspaceAccess.getAccountID(),
      workspaceId,
    })

    return result
  }

  async rewritePhraseTranslation({
    content,
    sourceLanguageId,
    requester,
    promptId,
  }: RewritePhraseTranslationParams) {
    const language = await this.prismaService.language.findUniqueOrThrow({
      where: { id: sourceLanguageId },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      language.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('auto_translation:use')

    let prompt:
      | (Prompt & { glossary: { terms: GlossaryTerm[] } | null })
      | null = null

    if (!isValidPromptTone(promptId)) {
      prompt = await this.prismaService.prompt.findUniqueOrThrow({
        where: { id: promptId },
        include: { glossary: { include: { terms: true } } },
      })

      if (prompt.workspaceId !== language.workspaceId) {
        throw new BadRequestException('Prompt is in different workspace')
      }
    }

    const response = await this.aiService.rewrite({
      content,
      prompt,
      defaultPromptTone: isValidPromptTone(promptId) ? promptId : null,
      workspaceId: language.workspaceId,
      accountId: workspaceAccess.getAccountID(),
      sourceLanguage: {
        id: sourceLanguageId,
        locale: language.locale,
      },
    })

    return response
  }
}
