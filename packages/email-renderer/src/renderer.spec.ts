import assert from 'assert'
import { isLayoutValid, renderHTML, renderTemplate } from './renderer'

describe('isLayoutValid', () => {
  it('should return true if the layout contains the `{{{ content }}}` tag', () => {
    const layout = 'Hello {{{ content }}}'
    expect(isLayoutValid(layout)).toBe(true)
  })

  it('should return true if the layout contains malformed `{{{ content }}}` tag', () => {
    const layout = 'Hello {{{content }}}'
    expect(isLayoutValid(layout)).toBe(true)
  })

  it('should return false if the layout does not contain the `{{{ content }}}` tag', () => {
    const layout = 'Hello'
    expect(isLayoutValid(layout)).toBe(false)
  })
})

describe('renderTemplate', () => {
  it('should render a template without a layout', () => {
    const template =
      '<mj-section><mj-column><mj-text>{{{ text }}}</mj-text></mj-column></mj-section>'
    const variables = { text: 'Hello John' }
    expect(renderTemplate({ template, variables })).toBe(
      '<mj-section><mj-column><mj-text>Hello John</mj-text></mj-column></mj-section>',
    )
  })

  it('should render a template with a layout', () => {
    const layout = '<mjml><mj-body>{{{ content }}}</mj-body></mjml>'

    const template =
      '<mj-section><mj-column><mj-text>{{{ text }}}</mj-text></mj-column></mj-section>'
    const variables = { text: 'Hello John' }

    expect(renderTemplate({ layout, template, variables })).toBe(
      '<mjml><mj-body><mj-section><mj-column><mj-text>Hello John</mj-text></mj-column></mj-section></mj-body></mjml>',
    )
  })

  it('should render a template with layout variables used in template', () => {
    const layout =
      '<mjml><mj-body bg-color="{{{ backgroundColor }}}">{{{ content }}}</mj-body></mjml>'
    const layoutVariables = { backgroundColor: 'red' }

    const template =
      '<mj-section><mj-column><mj-text color="{{{ backgroundColor }}}">{{{ text }}}</mj-text></mj-column></mj-section>'
    const variables = { text: 'Hello John' }

    expect(
      renderTemplate({ layout, layoutVariables, template, variables }),
    ).toBe(
      '<mjml><mj-body bg-color="red"><mj-section><mj-column><mj-text color="red">Hello John</mj-text></mj-column></mj-section></mj-body></mjml>',
    )
  })

  it('should prioritize template variables over layout variables if both provided', () => {
    const layout = '<mjml><mj-body>{{{ content }}}</mj-body></mjml>'
    const layoutVariables = { textColor: 'red' }

    const template =
      '<mj-section><mj-column><mj-text color="{{{ textColor }}}">{{{ text }}}</mj-text></mj-column></mj-section>'
    const variables = { text: 'Hello John', textColor: 'blue' }

    expect(
      renderTemplate({ layout, layoutVariables, template, variables }),
    ).toBe(
      '<mjml><mj-body><mj-section><mj-column><mj-text color="blue">Hello John</mj-text></mj-column></mj-section></mj-body></mjml>',
    )
  })
})

describe('renderHTML', () => {
  it('matches snapshot', async () => {
    const layout = '<mjml><mj-body>{{{ content }}}</mj-body></mjml>'

    const template =
      '<mj-section><mj-column><mj-text>{{{ text }}}</mj-text></mj-column></mj-section>'
    const variables = { text: 'Hello John' }

    const renderedTemplate = renderTemplate({ layout, template, variables })
    assert(renderedTemplate)

    const { html } = renderHTML(renderedTemplate)

    expect(String(html)).toMatchSnapshot()
  })
})
