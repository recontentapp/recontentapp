import { BadRequestException, Injectable } from '@nestjs/common'
import { renderHTML, renderTemplate } from 'email-renderer'
import mjml2html from 'mjml'
import { PrismaService } from 'src/utils/prisma.service'
import { Requester } from '../auth/requester.object'

interface RenderTemplateParams {
  id: string
  languageIds: string[]
  format: 'html' | 'mjml'
  requester: Requester
}

@Injectable()
export class EmailRenderService {
  constructor(private prismaService: PrismaService) {}

  async render({ id, languageIds, format, requester }: RenderTemplateParams) {
    const template = await this.prismaService.emailTemplate.findUniqueOrThrow({
      where: { id },
      include: {
        layout: {
          include: {
            variables: {
              include: {
                translations: {
                  where: {
                    languageId: {
                      in: languageIds,
                    },
                  },
                },
              },
            },
          },
        },
        variables: {
          include: {
            translations: {
              where: {
                languageId: {
                  in: languageIds,
                },
              },
            },
          },
        },
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      template.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const languageIdsInProjectCount = await this.prismaService.language.count({
      where: {
        id: {
          in: languageIds,
        },
        projects: {
          some: {
            id: template.projectId,
          },
        },
      },
    })
    if (languageIdsInProjectCount !== languageIds.length) {
      throw new BadRequestException('Some languages are not in the project')
    }

    const defaultRenderedTemplate = renderTemplate({
      layout: template.layout?.content,
      layoutVariables: template.layout?.variables.reduce<
        Record<string, string>
      >((acc, variable) => {
        const fallback = `{{{ ${variable.key} }}}`
        acc[variable.key] = variable.defaultContent || fallback
        return acc
      }, {}),
      template: template.content,
      variables: template.variables.reduce<Record<string, string>>(
        (acc, variable) => {
          const fallback = `{{{ ${variable.key} }}}`

          acc[variable.key] = variable.defaultContent || fallback
          return acc
        },
        {},
      ),
    })

    const translations: Array<{ languageId: string; content: string | null }> =
      []

    languageIds.forEach(languageId => {
      const renderedTemplate = renderTemplate({
        layout: template.layout?.content,
        layoutVariables: template.layout?.variables.reduce<
          Record<string, string>
        >((acc, variable) => {
          const translation = variable.translations.find(
            t => t.languageId === languageId,
          )
          const fallback = `{{{ ${variable.key} }}}`
          acc[variable.key] =
            translation?.content || variable.defaultContent || fallback
          return acc
        }, {}),
        template: template.content,
        variables: template.variables.reduce<Record<string, string>>(
          (acc, variable) => {
            const translation = variable.translations.find(
              t => t.languageId === languageId,
            )
            const fallback = `{{{ ${variable.key} }}}`
            acc[variable.key] =
              translation?.content || variable.defaultContent || fallback
            return acc
          },
          {},
        ),
      })

      translations.push({
        languageId,
        content: renderedTemplate
          ? format === 'mjml'
            ? renderedTemplate
            : renderHTML(renderedTemplate, mjml2html).html
          : null,
      })
    })

    return {
      default: {
        content: defaultRenderedTemplate
          ? format === 'mjml'
            ? defaultRenderedTemplate
            : renderHTML(defaultRenderedTemplate, mjml2html).html
          : null,
      },
      translations,
    }
  }
}
