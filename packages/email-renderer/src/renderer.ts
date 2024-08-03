import mjml from 'mjml-browser'
import { render as mustacheRender } from 'mustache'
import { CLOSING_TAG, OPENING_TAG } from './constants'
import { Variables } from './types'

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
const render = (template: string, variables: Variables = {}) =>
  mustacheRender(
    template,
    variables,
    {},
    {
      // Disable HTML escaping
      escape: val => val,
      tags: [OPENING_TAG, CLOSING_TAG],
    },
  )

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

  if (!layout || !isLayoutValid(layout)) {
    return renderedTemplate
  }

  const layoutVariablesBag: Variables = {
    ...layoutVariables,
    content: renderedTemplate,
  }

  return render(layout, layoutVariablesBag)
}

/**
 * Render a MJML template into plain HTML,
 * used for preview or to export as HTML
 *
 * If invalid, return null
 */
export const renderHTML = (mjmlTemplate: string): string | null => {
  const { html, errors } = mjml(mjmlTemplate)

  if (errors.length > 0 || !html) {
    return null
  }

  return html
}
