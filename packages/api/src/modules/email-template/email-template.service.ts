import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester } from '../auth/requester.object'

interface ListTemplatesParams {
  projectId: string
  key?: string
  pagination: PaginationParams
  requester: Requester
}

interface GetTemplateParams {
  id: string
  requester: Requester
}

interface CreateTemplateParams {
  projectId: string
  layoutId?: string
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

interface UpdateTemplateParams {
  id: string
  key: string
  layoutId?: string
  description?: string
  content: string
  variables: Array<{
    key: string
    defaultContent: string
    translations: Record<string, string>
  }>
  requester: Requester
}

interface DeleteTemplateParams {
  id: string
  requester: Requester
}

@Injectable()
export class EmailTemplateService {
  constructor(private prismaService: PrismaService) {}

  async listTemplates({
    projectId,
    key,
    pagination,
    requester,
  }: ListTemplatesParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const where: Prisma.EmailTemplateWhereInput = {
      projectId,
      ...(key && {
        key: {
          search: key,
          mode: 'insensitive',
        },
      }),
    }

    const { limit, offset, pageSize, page } = pagination
    const [templates, count] = await Promise.all([
      this.prismaService.emailTemplate.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.emailTemplate.count({
        where,
      }),
    ])

    return {
      items: templates,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async getTemplate({ id, requester }: GetTemplateParams) {
    const template = await this.prismaService.emailTemplate.findUniqueOrThrow({
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
      template.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return template
  }

  async createTemplate({
    projectId,
    layoutId,
    key,
    description,
    content,
    variables,
    requester,
  }: CreateTemplateParams) {
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

    if (layoutId) {
      const layout = await this.prismaService.emailLayout.findUniqueOrThrow({
        where: { id: layoutId },
      })
      if (layout.workspaceId !== project.workspaceId) {
        throw new BadRequestException('Layout does not belong to this project')
      }
    }

    const template = await this.prismaService.$transaction(async t => {
      const template = await t.emailTemplate.create({
        data: {
          projectId,
          layoutId,
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
              templateId: template.id,
              translations: {
                createMany: {
                  data: Object.entries(translations).map(
                    ([languageId, content]) => ({
                      languageId,
                      content,
                      workspaceId: template.workspaceId,
                    }),
                  ),
                },
              },
              workspaceId: project.workspaceId,
            },
          }),
        ),
      )

      return template
    })

    return template
  }

  async updateTemplate({
    id,
    layoutId,
    key,
    description,
    content,
    variables,
    requester,
  }: UpdateTemplateParams) {
    const template = await this.prismaService.emailTemplate.findUniqueOrThrow({
      where: { id },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      template.workspaceId,
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
          workspaceId: template.workspaceId,
        },
      })

      if (matchingLanguagesCount !== requestedLanguageIds.length) {
        throw new BadRequestException(
          'Some requested languages are not available',
        )
      }
    }

    if (layoutId) {
      const layout = await this.prismaService.emailLayout.findUniqueOrThrow({
        where: { id: layoutId },
      })
      if (layout.workspaceId !== template.workspaceId) {
        throw new BadRequestException('Layout does not belong to this project')
      }
    }

    const updatedTemplate = await this.prismaService.$transaction(async t => {
      await t.emailVariableTranslation.deleteMany({
        where: {
          variable: {
            templateId: id,
          },
        },
      })
      await t.emailVariable.deleteMany({
        where: {
          templateId: id,
        },
      })
      await Promise.all(
        variables.map(({ key, defaultContent, translations }) =>
          t.emailVariable.create({
            data: {
              key,
              defaultContent,
              templateId: template.id,
              translations: {
                createMany: {
                  data: Object.entries(translations).map(
                    ([languageId, content]) => ({
                      languageId,
                      content,
                      workspaceId: template.workspaceId,
                    }),
                  ),
                },
              },
              workspaceId: template.workspaceId,
            },
          }),
        ),
      )
      return t.emailTemplate.update({
        where: { id },
        data: {
          key,
          layoutId,
          description,
          content,
        },
      })
    })

    return updatedTemplate
  }

  async deleteTemplate({ id, requester }: DeleteTemplateParams) {
    const template = await this.prismaService.emailTemplate.findUniqueOrThrow({
      where: { id },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      template.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    await this.prismaService.$transaction(async t => {
      await t.emailVariableTranslation.deleteMany({
        where: {
          variable: {
            templateId: id,
          },
        },
      })
      await t.emailVariable.deleteMany({
        where: {
          templateId: id,
        },
      })
      await t.emailTemplate.delete({
        where: { id },
      })
    })
  }
}
