import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester } from '../auth/requester.object'

interface ListGlossariesParams {
  workspaceId: string
  projectId?: string
  pagination: PaginationParams
  requester: Requester
}

interface GetGlossaryParams {
  id: string
  requester: Requester
}

interface ListGlossaryTermsParams {
  glossaryId: string
  languageId?: string
  groupId?: string
  pagination: PaginationParams
  requester: Requester
}

interface CreateGlossaryParams {
  workspaceId: string
  name: string
  description?: string
  requester: Requester
}

interface LinkGlossaryWithProjectParams {
  glossaryId: string
  projectId: string
  requester: Requester
}

interface UnlinkGlossaryFromProjectParams {
  glossaryId: string
  projectId: string
  requester: Requester
}

interface UpdateGlossaryParams {
  id: string
  name: string
  description?: string
  requester: Requester
}

interface DeleteGlossaryParams {
  id: string
  requester: Requester
}

interface BatchCreateGlossaryTermParams {
  glossaryId: string
  terms: {
    groupId: string
    languageId?: string
    name: string
    description?: string
    forbidden: boolean
    caseSensitive: boolean
  }[]
  requester: Requester
}

interface BatchUpdateGlossaryTermParams {
  glossaryId: string
  terms: {
    id: string
    groupId: string
    languageId?: string
    name: string
    description?: string
    forbidden: boolean
    caseSensitive: boolean
  }[]
  requester: Requester
}

interface BatchDeleteGlossaryTermsParams {
  glossaryId: string
  ids: string[]
  requester: Requester
}

@Injectable()
export class GlossaryService {
  constructor(private prismaService: PrismaService) {}

  async listGlossaries({
    workspaceId,
    projectId,
    pagination,
    requester,
  }: ListGlossariesParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { limit, offset, pageSize, page } = pagination

    if (projectId) {
      const project = await this.prismaService.project.findUniqueOrThrow({
        where: { id: projectId },
      })
      if (project.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Project does not belong to the specified workspace',
        )
      }
    }

    const where: Prisma.GlossaryWhereInput = {
      workspaceId,
      ...(projectId ? { projects: { some: { id: projectId } } } : {}),
    }

    const [glossaries, count] = await Promise.all([
      this.prismaService.glossary.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.glossary.count({
        where,
      }),
    ])

    return {
      items: glossaries,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async getGlossary({ id, requester }: GetGlossaryParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return glossary
  }

  async listGlossaryTerms({
    glossaryId,
    languageId,
    groupId,
    pagination,
    requester,
  }: ListGlossaryTermsParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id: glossaryId },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    if (languageId) {
      const language = await this.prismaService.language.findUniqueOrThrow({
        where: { id: languageId },
      })
      if (language.workspaceId !== glossary.workspaceId) {
        throw new BadRequestException('Language does not belong to workspace')
      }
    }

    const { limit, offset, pageSize, page } = pagination

    const where: Prisma.GlossaryTermWhereInput = {
      AND: [
        {
          glossaryId,
          ...(groupId ? { groupId } : {}),
        },
        ...(languageId
          ? [
              {
                OR: [
                  {
                    languageId,
                  },
                  {
                    languageId: null,
                  },
                ],
              },
            ]
          : []),
      ],
    }

    const [terms, count] = await Promise.all([
      this.prismaService.glossaryTerm.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.glossaryTerm.count({
        where,
      }),
    ])

    return {
      items: terms,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createGlossary({
    name,
    description,
    workspaceId,
    requester,
  }: CreateGlossaryParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    const glossary = await this.prismaService.glossary.create({
      data: {
        name,
        description,
        workspaceId,
        createdBy: workspaceAccess.getAccountID(),
      },
    })

    return glossary
  }

  async updateGlossary({
    id,
    name,
    description,
    requester,
  }: UpdateGlossaryParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    const updatedGlossary = await this.prismaService.glossary.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        updatedBy: workspaceAccess.getAccountID(),
      },
    })

    return updatedGlossary
  }

  async deleteGlossary({ id, requester }: DeleteGlossaryParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    await this.prismaService.$transaction(async t => {
      await t.glossaryTerm.deleteMany({
        where: {
          glossaryId: id,
        },
      })

      await t.glossary.delete({
        where: { id },
      })
    })
  }

  async linkGlossaryWithProject({
    glossaryId,
    projectId,
    requester,
  }: LinkGlossaryWithProjectParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id: glossaryId },
    })
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    if (glossary.workspaceId !== project.workspaceId) {
      throw new BadRequestException(
        'Glossary and project do not belong to the same workspace',
      )
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    await this.prismaService.glossary.update({
      where: { id: glossaryId },
      data: {
        projects: {
          connect: {
            id: projectId,
          },
        },
      },
    })
  }

  async unlinkGlossaryFromProject({
    glossaryId,
    projectId,
    requester,
  }: UnlinkGlossaryFromProjectParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id: glossaryId },
    })
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    if (glossary.workspaceId !== project.workspaceId) {
      throw new BadRequestException(
        'Glossary and project do not belong to the same workspace',
      )
    }

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    await this.prismaService.glossary.update({
      where: { id: glossaryId },
      data: {
        projects: {
          disconnect: {
            id: projectId,
          },
        },
      },
    })
  }

  async batchCreateGlossaryTerm({
    glossaryId,
    terms,
    requester,
  }: BatchCreateGlossaryTermParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id: glossaryId },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    const languageIds = terms
      .map(term => term.languageId)
      .filter((a: string | undefined): a is string => !!a)
    const languagesCount = await this.prismaService.language.count({
      where: {
        id: {
          in: languageIds,
        },
        workspaceId: glossary.workspaceId,
      },
    })
    if (languagesCount !== languageIds.length) {
      throw new BadRequestException('Invalid language IDs')
    }

    await this.prismaService.glossaryTerm.createMany({
      data: terms.map(term => ({
        groupId: term.groupId,
        glossaryId,
        languageId: term.languageId,
        workspaceId: glossary.workspaceId,
        name: term.name,
        description: term.description,
        forbidden: term.forbidden,
        caseSensitive: term.caseSensitive,
        createdBy: workspaceAccess.getAccountID(),
      })),
    })
  }

  async batchUpdateGlossaryTerm({
    glossaryId,
    terms,
    requester,
  }: BatchUpdateGlossaryTermParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id: glossaryId },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    const languageIds = terms
      .map(term => term.languageId)
      .filter((a: string | undefined): a is string => !!a)
    const languagesCount = await this.prismaService.language.count({
      where: {
        id: {
          in: languageIds,
        },
        workspaceId: glossary.workspaceId,
      },
    })
    if (languagesCount !== languageIds.length) {
      throw new BadRequestException('Invalid language IDs')
    }

    await this.prismaService.$transaction(
      terms.map(term =>
        this.prismaService.glossaryTerm.update({
          where: { id: term.id, glossaryId },
          data: {
            groupId: term.groupId,
            languageId: term.languageId,
            name: term.name,
            description: term.description,
            forbidden: term.forbidden,
            caseSensitive: term.caseSensitive,
            updatedBy: workspaceAccess.getAccountID(),
          },
        }),
      ),
    )
  }

  async batchDeleteGlossaryTerms({
    glossaryId,
    ids,
    requester,
  }: BatchDeleteGlossaryTermsParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id: glossaryId },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    await this.prismaService.glossaryTerm.deleteMany({
      where: {
        glossaryId,
        id: {
          in: ids,
        },
      },
    })
  }
}
