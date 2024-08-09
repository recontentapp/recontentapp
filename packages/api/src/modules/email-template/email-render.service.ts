import { BadRequestException, Injectable } from '@nestjs/common'
import { Language } from '@prisma/client'
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

    const languages = await this.prismaService.language.findMany({
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
    if (languages.length !== languageIds.length) {
      throw new BadRequestException('Some languages are not in the project')
    }

    const languagesMap = languages.reduce<Record<string, Language>>(
      (acc, l) => {
        acc[l.id] = l
        return acc
      },
      {},
    )

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

    const translations: Array<{
      language: {
        id: string
        locale: string
        name: string
      }
      content: string | null
    }> = []

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
        language: {
          id: languageId,
          locale: languagesMap[languageId].locale,
          name: languagesMap[languageId].name,
        },
        content: renderedTemplate
          ? format === 'mjml'
            ? renderedTemplate
            : renderHTML(renderedTemplate, mjml2html).html
          : null,
      })
    })

    return {
      key: template.key,
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
