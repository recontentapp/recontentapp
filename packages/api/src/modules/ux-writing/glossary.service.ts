import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester } from '../auth/requester.object'

interface ListGlossariesParams {
  workspaceId: string
  pagination: PaginationParams
  requester: Requester
}

interface GetGlossaryParams {
  id: string
  requester: Requester
}

interface ListGlossaryTermsParams {
  glossaryId: string
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

interface CreateGlossaryTermParams {
  requester: Requester
  glossaryId: string
  name: string
  description?: string
  forbidden: boolean
  nonTranslatable: boolean
  caseSensitive: boolean
  translations: Array<{
    languageId: string
    content: string
  }>
}

interface UpdateGlossaryTermParams {
  requester: Requester
  id: string
  name: string
  description?: string
  forbidden: boolean
  nonTranslatable: boolean
  caseSensitive: boolean
  translations: Array<{
    languageId: string
    content: string
  }>
}

interface DeleteGlossaryTermParams {
  id: string
  requester: Requester
}

@Injectable()
export class GlossaryService {
  constructor(private prismaService: PrismaService) {}

  async listGlossaries({
    workspaceId,
    pagination,
    requester,
  }: ListGlossariesParams) {
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { limit, offset, pageSize, page } = pagination

    const where: Prisma.GlossaryWhereInput = {
      workspaceId,
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

    const { limit, offset, pageSize, page } = pagination

    const where: Prisma.GlossaryTermWhereInput = {
      glossaryId,
    }

    const [terms, count] = await Promise.all([
      this.prismaService.glossaryTerm.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          translations: true,
        },
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
      await t.glossaryTermTranslation.deleteMany({
        where: {
          term: {
            glossaryId: id,
          },
        },
      })
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

    if (project.glossaryId) {
      throw new BadRequestException('Project already has a glossary linked')
    }

    await this.prismaService.project.update({
      where: { id: projectId },
      data: {
        glossaryId,
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

    if (project.glossaryId !== glossaryId) {
      throw new BadRequestException('Glossary is not linked to the project')
    }

    await this.prismaService.project.update({
      where: { id: projectId },
      data: {
        glossaryId: null,
      },
    })
  }

  async createGlossaryTerm({
    glossaryId,
    requester,
    name,
    description,
    forbidden,
    nonTranslatable,
    caseSensitive,
    translations,
  }: CreateGlossaryTermParams) {
    const glossary = await this.prismaService.glossary.findUniqueOrThrow({
      where: { id: glossaryId },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    const languageIds = translations.map(term => term.languageId)
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
    if (nonTranslatable && translations.length > 0) {
      throw new BadRequestException(
        'Non-translatable terms should not have translations',
      )
    }

    await this.prismaService.glossaryTerm.create({
      data: {
        glossaryId,
        name,
        description,
        forbidden,
        nonTranslatable,
        caseSensitive,
        workspaceId: glossary.workspaceId,
        translations: {
          create: translations.map(translation => ({
            languageId: translation.languageId,
            content: translation.content,
            workspaceId: glossary.workspaceId,
          })),
        },
        createdBy: workspaceAccess.getAccountID(),
      },
    })
  }

  async updateGlossaryTerm({
    requester,
    id,
    name,
    description,
    forbidden,
    nonTranslatable,
    caseSensitive,
    translations,
  }: UpdateGlossaryTermParams) {
    const term = await this.prismaService.glossaryTerm.findUniqueOrThrow({
      where: { id },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      term.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    const languageIds = translations.map(t => t.languageId)
    const languagesCount = await this.prismaService.language.count({
      where: {
        id: {
          in: languageIds,
        },
        workspaceId: term.workspaceId,
      },
    })
    if (languagesCount !== languageIds.length) {
      throw new BadRequestException('Invalid language IDs')
    }
    if (nonTranslatable && translations.length > 0) {
      throw new BadRequestException(
        'Non-translatable terms should not have translations',
      )
    }

    await this.prismaService.$transaction(async t => {
      await t.glossaryTerm.update({
        where: { id },
        data: {
          name,
          description,
          forbidden,
          nonTranslatable,
          caseSensitive,
          updatedBy: workspaceAccess.getAccountID(),
        },
      })

      await t.glossaryTermTranslation.deleteMany({
        where: {
          termId: id,
        },
      })

      await t.glossaryTermTranslation.createMany({
        data: translations.map(translation => ({
          termId: id,
          languageId: translation.languageId,
          content: translation.content,
          workspaceId: term.workspaceId,
        })),
      })
    })
  }

  async deleteGlossaryTerm({ id, requester }: DeleteGlossaryTermParams) {
    const glossary = await this.prismaService.glossaryTerm.findUniqueOrThrow({
      where: { id },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      glossary.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('glossaries:manage')

    await this.prismaService.$transaction(async t => {
      await t.glossaryTermTranslation.deleteMany({
        where: {
          termId: id,
        },
      })

      await t.glossaryTerm.deleteMany({
        where: {
          id,
        },
      })
    })
  }
}
