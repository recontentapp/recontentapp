import mjml from 'mjml-browser'
import { render as mustacheRender } from 'mustache'
import { CLOSING_TAG, OPENING_TAG } from './constants'
import { HTMLRenderResult, Variables } from './types'

/**
 * Check if a layout is valid by checking if it contains
 * the `{{{ content }}}` tag that will be replaced by the
 * rendered template
 */
export const isLayoutValid = (layout: string) => {
  const regex = /\{\{\{\s*content\s*\}\}\}/
  return regex.test(layout)
}

/**
 * Render a mustache template with potential
 * variables enclosed between `{{{ variable }}}`
 */
const render = (template: string, variables: Variables = {}) => {
  try {
    return mustacheRender(
      template,
      variables,
      {},
      {
        // Disable HTML escaping
        escape: val => val,
        tags: [OPENING_TAG, CLOSING_TAG],
      },
    )
  } catch (error) {
    return null
  }
}

interface RenderTemplateParams {
  layout?: string
  layoutVariables?: Variables
  template: string
  variables: Variables
}

export const renderTemplate = ({
  layout,
  layoutVariables,
  template,
  variables,
}: RenderTemplateParams): string | null => {
  const variablesBag: Variables = {
    ...layoutVariables,
    ...variables,
  }

  const renderedTemplate = render(template, variablesBag)

  if (!layout || !isLayoutValid(layout) || !renderedTemplate) {
    return renderedTemplate
  }

  return render(layout, {
    ...variablesBag,
    content: renderedTemplate,
  })
}

type MJMLParseError = ReturnType<typeof mjml>['errors'][0]

const formatErrors = (errors: MJMLParseError[]): string[] => {
  const set = new Set<string>()

  errors.forEach(error => {
    set.add(error.message)
  })

  return Array.from(set)
}

/**
 * Render a MJML template into plain HTML,
 * used for preview or to export as HTML
 *
 * If invalid, return null
 */
export const renderHTML = (mjmlTemplate: string): HTMLRenderResult => {
  try {
    const { html, errors } = mjml(mjmlTemplate)
    return {
      html,
      errors:
        errors.length > 0
          ? {
              level: 'warning',
              messages: formatErrors(errors),
            }
          : null,
    }
  } catch (error) {
    return {
      html: null,
      errors: {
        level: 'error',
        messages: ['Error while rendering HTML'],
      },
    }
  }
}
