import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { v4 as uuidV4 } from 'uuid'
import { PrismaService } from 'src/utils/prisma.service'
import { PaginationParams } from 'src/utils/pagination'
import { Requester } from '../auth/requester.object'

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
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return file
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
              search: query,
            },
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
    const file = await this.prismaService.figmaFile.findUniqueOrThrow({
      where: {
        id: fileId,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      file.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

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

    const inputs: Prisma.FigmaTextCreateInput[] = items.map(item => {
      if ('phraseId' in item) {
        const input: Prisma.FigmaTextCreateInput = {
          file: {
            connect: {
              id: fileId,
            },
          },
          phrase: {
            connect: {
              id: item.phraseId,
            },
          },
          workspace: {
            connect: {
              id: file.workspaceId,
            },
          },
          pageNodeId: item.pageNodeId,
          textNodeId: item.textNodeId,
          createdBy: workspaceAccess.getAccountID(),
        }

        return input
      }

      const input: Prisma.FigmaTextCreateInput = {
        file: {
          connect: {
            id: fileId,
          },
        },
        workspace: {
          connect: {
            id: file.workspaceId,
          },
        },
        phrase: {
          create: {
            key: item.phraseKey ?? FigmaService.generatePhraseKey(),
            revision: {
              connect: {
                id: file.revisionId,
              },
            },
            project: {
              connect: {
                id: file.projectId,
              },
            },
            createdBy: workspaceAccess.getAccountID(),
            workspace: {
              connect: {
                id: file.workspaceId,
              },
            },
            translations: {
              create: {
                language: {
                  connect: {
                    id: file.languageId,
                  },
                },
                content: item.content,
                revision: {
                  connect: {
                    id: file.revisionId,
                  },
                },
                workspace: {
                  connect: {
                    id: file.workspaceId,
                  },
                },
                createdBy: workspaceAccess.getAccountID(),
              },
            },
          },
        },
        pageNodeId: item.pageNodeId,
        textNodeId: item.textNodeId,
        createdBy: workspaceAccess.getAccountID(),
      }

      return input
    })

    const texts = await this.prismaService.$transaction(
      inputs.map(input =>
        this.prismaService.figmaText.create({
          data: input,
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
        }),
      ),
    )

    return texts
  }
}
