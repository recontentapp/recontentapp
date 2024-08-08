import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester } from '../auth/requester.object'

interface ListLayoutsParams {
  projectId: string
  key?: string
  pagination: PaginationParams
  requester: Requester
}

interface GetLayoutParams {
  id: string
  requester: Requester
}

interface CreateLayoutParams {
  projectId: string
  key: string
  description?: string
  content: string
  variables: Array<{
    key: string
    defaultContent: string
    translations: Record<string, string>
  }>
  requester: Requester
}

interface UpdateLayoutParams {
  id: string
  key: string
  description?: string
  content: string
  variables: Array<{
    key: string
    defaultContent: string
    translations: Record<string, string>
  }>
  requester: Requester
}

interface DeleteLayoutParams {
  id: string
  requester: Requester
}

@Injectable()
export class EmailLayoutService {
  constructor(private prismaService: PrismaService) {}

  async listLayouts({
    projectId,
    key,
    pagination,
    requester,
  }: ListLayoutsParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const where: Prisma.EmailLayoutWhereInput = {
      projectId,
      ...(key && {
        key: {
          search: key,
          mode: 'insensitive',
        },
      }),
    }

    const { limit, offset, pageSize, page } = pagination
    const [layouts, count] = await Promise.all([
      this.prismaService.emailLayout.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.emailLayout.count({
        where,
      }),
    ])

    return {
      items: layouts,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async getLayout({ id, requester }: GetLayoutParams) {
    const layout = await this.prismaService.emailLayout.findUniqueOrThrow({
      where: { id },
      include: {
        variables: {
          include: {
            translations: true,
          },
        },
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      layout.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return layout
  }

  async createLayout({
    projectId,
    key,
    description,
    content,
    variables,
    requester,
  }: CreateLayoutParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const requestedLanguageIds = variables
      .map(v => Object.keys(v.translations))
      .flat()

    if (requestedLanguageIds.length > 0) {
      const matchingLanguagesCount = await this.prismaService.language.count({
        where: {
          id: {
            in: requestedLanguageIds,
          },
          workspaceId: project.workspaceId,
        },
      })

      if (matchingLanguagesCount !== requestedLanguageIds.length) {
        throw new BadRequestException(
          'Some requested languages are not available',
        )
      }
    }

    const layout = await this.prismaService.$transaction(async t => {
      const layout = await t.emailLayout.create({
        data: {
          projectId,
          key,
          description,
          content,
          workspaceId: project.workspaceId,
          createdBy: workspaceAccess.getAccountID(),
        },
      })

      await Promise.all(
        variables.map(({ key, defaultContent, translations }) =>
          t.emailVariable.create({
            data: {
              key,
              defaultContent,
              layoutId: layout.id,
              translations: {
                createMany: {
                  data: Object.entries(translations).map(
                    ([languageId, content]) => ({
                      languageId,
                      content,
                      workspaceId: layout.workspaceId,
                    }),
                  ),
                },
              },
              workspaceId: project.workspaceId,
            },
          }),
        ),
      )

      return layout
    })

    return layout
  }

  async updateLayout({
    id,
    key,
    description,
    content,
    variables,
    requester,
  }: UpdateLayoutParams) {
    const layout = await this.prismaService.emailLayout.findUniqueOrThrow({
      where: { id },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      layout.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const requestedLanguageIds = variables
      .map(v => Object.keys(v.translations))
      .flat()

    if (requestedLanguageIds.length > 0) {
      const matchingLanguagesCount = await this.prismaService.language.count({
        where: {
          id: {
            in: requestedLanguageIds,
          },
          workspaceId: layout.workspaceId,
        },
      })

      if (matchingLanguagesCount !== requestedLanguageIds.length) {
        throw new BadRequestException(
          'Some requested languages are not available',
        )
      }
    }

    const updatedLayout = await this.prismaService.$transaction(async t => {
      await t.emailVariableTranslation.deleteMany({
        where: {
          variable: {
            layoutId: id,
          },
        },
      })
      await t.emailVariable.deleteMany({
        where: {
          layoutId: id,
        },
      })
      await Promise.all(
        variables.map(({ key, defaultContent, translations }) =>
          t.emailVariable.create({
            data: {
              key,
              defaultContent,
              layoutId: layout.id,
              translations: {
                createMany: {
                  data: Object.entries(translations).map(
                    ([languageId, content]) => ({
                      languageId,
                      content,
                      workspaceId: layout.workspaceId,
                    }),
                  ),
                },
              },
              workspaceId: layout.workspaceId,
            },
          }),
        ),
      )

      return t.emailLayout.update({
        where: { id },
        data: {
          key,
          description,
          content,
        },
      })
    })

    return updatedLayout
  }

  async deleteLayout({ id, requester }: DeleteLayoutParams) {
    const layout = await this.prismaService.emailLayout.findUniqueOrThrow({
      where: { id },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      layout.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const templatesUsingLayoutCount =
      await this.prismaService.emailTemplate.count({
        where: {
          layoutId: id,
        },
      })
    if (templatesUsingLayoutCount > 0) {
      throw new BadRequestException(
        'Cannot delete layout because it is used by some templates',
      )
    }

    await this.prismaService.$transaction(async t => {
      await t.emailVariableTranslation.deleteMany({
        where: {
          variable: {
            layoutId: id,
          },
        },
      })
      await t.emailVariable.deleteMany({
        where: {
          layoutId: id,
        },
      })
      await t.emailLayout.delete({
        where: { id },
      })
    })
  }
}
