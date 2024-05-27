import {
  BadRequestException,
  ImATeapotException,
  Injectable,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { v4 as uuidV4 } from 'uuid'
import { PrismaService } from 'src/utils/prisma.service'
import { PaginationParams } from 'src/utils/pagination'
import { Requester } from '../auth/requester.object'

interface ListFilesParams {
  projectId: string
  pagination: PaginationParams
  requester: Requester
}

interface CreateFileParams {
  requester: Requester
  revisionId: string
  languageId: string
  url: string
  name: string
}

interface GetFileParams {
  requester: Requester
  id: string
}

interface DeleteFileParams {
  requester: Requester
  id: string
}

interface ListAvailablePhrasesParams {
  requester: Requester
  fileId: string
  query: string
}

interface ListFileTextsParams {
  fileId: string
  pageNodeId: string
  requester: Requester
  pagination: PaginationParams
}

interface CreateFileTextAndPhraseParams {
  phraseKey: string | null
  content: string
  textNodeId: string
  pageNodeId: string
}

interface CreateFileTextAndConnectPhraseParams {
  phraseId: string
  textNodeId: string
  pageNodeId: string
}

interface CreateFileTextsParams {
  fileId: string
  requester: Requester
  items: Array<
    CreateFileTextAndPhraseParams | CreateFileTextAndConnectPhraseParams
  >
}

interface UpdateFileTextParams {
  id: string
  requester: Requester
  content: string
}

interface UpdateFileParams {
  id: string
  requester: Requester
  languageId: string
}

@Injectable()
export class FigmaService {
  constructor(private prismaService: PrismaService) {}

  private static generatePhraseKey() {
    return `figma_${uuidV4()}`
  }

  private static isValidURL(url: string): { isValid: boolean; key: string } {
    const regex =
      /https:\/\/[\w\.-]+\.?figma.com\/([\w-]+)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/i

    if (!regex.test(url)) {
      return { isValid: false, key: '' }
    }

    const result = regex.exec(url) ?? []

    return {
      isValid: true,
      key: result[2],
    }
  }

  async listFiles({ projectId, pagination, requester }: ListFilesParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { limit, offset, pageSize, page } = pagination
    const [files, count] = await Promise.all([
      this.prismaService.figmaFile.findMany({
        where: {
          projectId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.figmaFile.count({
        where: {
          projectId,
        },
      }),
    ])

    return {
      items: files,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createFile({
    requester,
    revisionId,
    languageId,
    url,
    name,
  }: CreateFileParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: {
          id: revisionId,
        },
        include: {
          project: {
            include: {
              languages: {
                where: {
                  id: languageId,
                },
              },
            },
          },
        },
      },
    )

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const languageInProject = revision.project.languages.find(
      language => language.id === languageId,
    )
    if (!languageInProject) {
      throw new BadRequestException('Language not found in project')
    }

    const { isValid, key } = FigmaService.isValidURL(url)

    if (!isValid) {
      throw new BadRequestException('Invalid Figma URL')
    }

    const file = await this.prismaService.figmaFile.create({
      include: {
        workspace: true,
        language: true,
        project: true,
      },
      data: {
        name,
        key,
        url,
        languageId,
        revisionId,
        workspaceId: revision.workspaceId,
        projectId: revision.projectId,
        createdBy: workspaceAccess.getAccountID(),
      },
    })

    return file
  }

  async getFile({ id, requester }: GetFileParams) {
    const file = await this.prismaService.figmaFile.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        workspace: true,
        language: true,
        project: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return file
  }

  async updateFile({ id, requester, languageId }: UpdateFileParams) {
    const file = await this.prismaService.figmaFile.findUniqueOrThrow({
      where: {
        id,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id: file.projectId,
      },
      include: {
        languages: {
          where: {
            id: languageId,
          },
        },
      },
    })

    const languageInProject = project.languages.find(
      language => language.id === languageId,
    )
    if (!languageInProject) {
      throw new BadRequestException('Language not found in project')
    }

    const updatedFile = await this.prismaService.figmaFile.update({
      where: {
        id,
      },
      data: {
        languageId,
      },
      include: {
        workspace: true,
        language: true,
        project: true,
      },
    })

    return updatedFile
  }

  async deleteFile({ id, requester }: DeleteFileParams) {
    const file = await this.prismaService.figmaFile.findUniqueOrThrow({
      where: {
        id,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    await this.prismaService.$transaction(async t => {
      await t.figmaText.deleteMany({
        where: {
          fileId: file.id,
        },
      })

      await t.figmaFile.delete({
        where: {
          id: file.id,
        },
      })
    })
  }

  async listAvailablePhrases({
    fileId,
    query,
    requester,
  }: ListAvailablePhrasesParams) {
    const file = await this.prismaService.figmaFile.findUniqueOrThrow({
      where: {
        id: fileId,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const phrases = await this.prismaService.phrase.findMany({
      where: {
        revisionId: file.revisionId,
        OR: [
          {
            key: {
              contains: query,
            },
          },
          {
            translations: {
              some: {
                languageId: file.languageId,
                content: {
                  search: query,
                },
              },
            },
          },
        ],
      },
      include: {
        translations: {
          where: {
            languageId: file.languageId,
          },
        },
      },
      take: 50,
    })

    return phrases
  }

  async listFileTexts({
    fileId,
    pageNodeId,
    pagination,
    requester,
  }: ListFileTextsParams) {
    const file = await this.prismaService.figmaFile.findUniqueOrThrow({
      where: {
        id: fileId,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const where: Prisma.FigmaTextWhereInput = {
      fileId,
      pageNodeId,
    }

    const { limit, offset, pageSize, page } = pagination
    const [texts, count] = await Promise.all([
      this.prismaService.figmaText.findMany({
        where,
        include: {
          phrase: {
            include: {
              translations: {
                where: {
                  languageId: file.languageId,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.figmaText.count({
        where,
      }),
    ])

    return {
      items: texts,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createFileTexts({ requester, fileId, items }: CreateFileTextsParams) {
    const phrasesToCreateCount = items.filter(i => !('phraseId' in i)).length
    const file = await this.prismaService.figmaFile.findUniqueOrThrow({
      where: {
        id: fileId,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')
    const { phrasesCount } = workspaceAccess.getLimits()

    const existingPhraseCount = await this.prismaService.phrase.count({
      where: {
        workspaceId: file.workspaceId,
      },
    })
    if (existingPhraseCount + phrasesToCreateCount > phrasesCount) {
      throw new ImATeapotException(
        'Workspace has reached phrases limit with current plan',
      )
    }

    const phraseIdsToCheck = items.reduce<string[]>((acc, item) => {
      if ('phraseId' in item) {
        acc.push(item.phraseId)
      }

      return acc
    }, [])
    const phraseKeysToCheck = items.reduce<string[]>((acc, item) => {
      if ('phraseKey' in item && item.phraseKey) {
        acc.push(item.phraseKey)
      }

      return acc
    }, [])

    const existingPhrasesWithIdCount = await this.prismaService.phrase.count({
      where: {
        id: {
          in: phraseIdsToCheck,
        },
        revisionId: file.revisionId,
      },
    })
    if (existingPhrasesWithIdCount !== phraseIdsToCheck.length) {
      throw new BadRequestException(
        'Cannot connect text to non-existent phrase',
      )
    }

    const existingPhrasesWithKeyCount = await this.prismaService.phrase.count({
      where: {
        key: {
          in: phraseKeysToCheck,
        },
        revisionId: file.revisionId,
      },
    })
    if (existingPhrasesWithKeyCount > 0) {
      throw new BadRequestException(
        'Some phrases with requested key already exist',
      )
    }

    interface IntermediateStruct {
      isNew: boolean
      phraseId: string
      phraseKey: string
      translation: string
      textNodeId: string
      pageNodeId: string
    }

    const intermediateStruct: Record<string, IntermediateStruct> = {}

    items.forEach(item => {
      if ('phraseId' in item) {
        intermediateStruct[item.phraseId] = {
          isNew: false,
          phraseId: item.phraseId,
          phraseKey: '',
          translation: '',
          textNodeId: item.textNodeId,
          pageNodeId: item.pageNodeId,
        }
      } else {
        const phraseId = uuidV4()

        intermediateStruct[phraseId] = {
          isNew: true,
          phraseId,
          phraseKey: item.phraseKey ?? FigmaService.generatePhraseKey(),
          translation: item.content,
          textNodeId: item.textNodeId,
          pageNodeId: item.pageNodeId,
        }
      }
    })

    const existingPhrases = Object.values(intermediateStruct).filter(
      i => !i.isNew,
    )
    const phrasesToCreate = Object.values(intermediateStruct).filter(
      i => i.isNew,
    )

    const texts = await this.prismaService.$transaction(
      async t => {
        // Insert new phrases (some might already exist with the same key)
        await t.phrase.createMany({
          data: phrasesToCreate.map(phrase => ({
            id: phrase.phraseId,
            key: phrase.phraseKey,
            revisionId: file.revisionId,
            projectId: file.projectId,
            workspaceId: file.workspaceId,
            createdBy: workspaceAccess.getAccountID(),
          })),
          skipDuplicates: true,
        })

        const phrases = await t.phrase.findMany({
          select: {
            id: true,
          },
          where: {
            id: {
              in: phrasesToCreate.map(phrase => phrase.phraseId),
            },
          },
        })

        const translations: Prisma.PhraseTranslationCreateManyInput[] = []
        phrases.forEach(({ id }) => {
          translations.push({
            phraseId: id,
            content: intermediateStruct[id].translation,
            languageId: file.languageId,
            workspaceId: file.workspaceId,
            revisionId: file.revisionId,
            createdBy: workspaceAccess.getAccountID(),
          })
        })

        await t.phraseTranslation.createMany({
          data: translations,
          skipDuplicates: true,
        })

        const allPhraseIds = [
          ...existingPhrases.map(phrase => phrase.phraseId),
          ...phrases.map(phrase => phrase.id),
        ]

        await t.figmaText.createMany({
          data: allPhraseIds.map(phraseId => ({
            fileId: file.id,
            workspaceId: file.workspaceId,
            phraseId,
            textNodeId: intermediateStruct[phraseId].textNodeId,
            pageNodeId: intermediateStruct[phraseId].pageNodeId,
            createdBy: workspaceAccess.getAccountID(),
          })),
        })

        return t.figmaText.findMany({
          where: {
            fileId: file.id,
            phraseId: {
              in: allPhraseIds,
            },
          },
          include: {
            phrase: {
              include: {
                translations: {
                  where: {
                    languageId: file.languageId,
                  },
                },
              },
            },
          },
        })
      },
      // Long-running transaction in case of large imports
      { timeout: 20000 },
    )

    return texts
  }

  async updateFileText({ id, requester, content }: UpdateFileTextParams) {
    const text = await this.prismaService.figmaText.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        file: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      text.file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    await this.prismaService.phraseTranslation.upsert({
      where: {
        phraseId_languageId_revisionId: {
          phraseId: text.phraseId,
          languageId: text.file.languageId,
          revisionId: text.file.revisionId,
        },
      },
      create: {
        content,
        languageId: text.file.languageId,
        revisionId: text.file.revisionId,
        phraseId: text.phraseId,
        workspaceId: text.file.workspaceId,
        createdBy: workspaceAccess.getAccountID(),
      },
      update: {
        content,
        updatedBy: workspaceAccess.getAccountID(),
      },
    })

    const updatedText = await this.prismaService.figmaText.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        phrase: {
          include: {
            translations: {
              where: {
                languageId: text.file.languageId,
              },
            },
          },
        },
      },
    })

    return updatedText
  }
}
