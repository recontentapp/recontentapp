import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { HumanRequester } from 'src/utils/requester'

interface ListPhrasesParams {
  revisionId: string
  pagination: PaginationParams
  requester: HumanRequester
}

interface CreatePhraseParams {
  revisionId: string
  key: string
  requester: HumanRequester
}

interface UpdatePhraseKeyParams {
  phraseId: string
  key: string
  requester: HumanRequester
}

interface TranslatePhraseParams {
  phraseId: string
  requester: HumanRequester
  translations: Array<{
    languageId: string
    content: string
  }>
}

interface DeletePhraseParams {
  phraseId: string
  requester: HumanRequester
}

interface GetPhraseParams {
  phraseId: string
  requester: HumanRequester
}

@Injectable()
export class PhraseService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async listPhrases({ revisionId, pagination, requester }: ListPhrasesParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const { limit, offset, pageSize, page } = pagination
    const [phrases, count] = await Promise.all([
      this.prismaService.phrase.findMany({
        where: {
          revisionId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.phrase.count({
        where: {
          revisionId,
        },
      }),
    ])

    return {
      items: phrases,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createPhrase({ key, requester, revisionId }: CreatePhraseParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const phrase = await this.prismaService.phrase.create({
      data: {
        key,
        revisionId,
        projectId: revision.projectId,
        workspaceId: revision.workspaceId,
        createdBy: requester.getAccountIDForWorkspace(revision.workspaceId)!,
      },
      include: { translations: true },
    })

    return phrase
  }

  async getPhrase({ phraseId, requester }: GetPhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
      include: {
        translations: true,
      },
    })

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    return phrase
  }

  async updatePhraseKey({ phraseId, key, requester }: UpdatePhraseKeyParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
    })

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const updatedPhrase = await this.prismaService.phrase.update({
      where: { id: phraseId },
      data: {
        key,
        updatedBy: requester.getAccountIDForWorkspace(phrase.workspaceId)!,
      },
      include: {
        translations: true,
      },
    })

    return updatedPhrase
  }

  async translatePhrase({
    phraseId,
    translations,
    requester,
  }: TranslatePhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
      include: {
        project: {
          include: {
            languages: true,
          },
        },
      },
    })

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const availableLanguages = phrase.project.languages.map(
      language => language.id,
    )
    const requestedLanguages = translations.map(({ languageId }) => languageId)
    const someLanguagesDoNotExist = requestedLanguages.some(
      languageId => !availableLanguages.includes(languageId),
    )
    if (someLanguagesDoNotExist) {
      throw new BadRequestException('Some languages do not exist in project')
    }

    const existingTranslations =
      await this.prismaService.phraseTranslation.findMany({
        where: {
          phraseId,
        },
      })

    const toInsert: Array<{ languageId: string; content: string }> = []
    const toUpdate: Array<{
      translationId: string
      content: string
    }> = []

    translations.forEach(({ languageId, content }) => {
      const index = existingTranslations.findIndex(
        t => t.languageId === languageId,
      )

      if (index === -1) {
        toInsert.push({ languageId, content })
      } else {
        toUpdate.push({
          translationId: existingTranslations[index].id,
          content,
        })
      }
    })

    const createdBy = requester.getAccountIDForWorkspace(phrase.workspaceId)!

    await this.prismaService.$transaction([
      ...toInsert.map(({ languageId, content }) =>
        this.prismaService.phraseTranslation.create({
          data: {
            content: content,
            createdBy,
            languageId,
            phraseId,
            workspaceId: phrase.workspaceId,
            revisionId: phrase.revisionId,
          },
        }),
      ),
      ...toUpdate.map(({ translationId, content }) =>
        this.prismaService.phraseTranslation.update({
          where: {
            id: translationId,
          },
          data: {
            content,
            updatedBy: createdBy,
          },
        }),
      ),
    ])

    return this.prismaService.phrase.findFirstOrThrow({
      where: {
        id: phraseId,
      },
      include: {
        translations: true,
      },
    })
  }

  async deletePhrase({ phraseId, requester }: DeletePhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
    })

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    await this.prismaService.$transaction(async t => {
      await t.phraseTranslation.deleteMany({
        where: {
          phraseId,
        },
      })
      await t.phrase.delete({
        where: {
          id: phraseId,
        },
      })
    })
  }
}
