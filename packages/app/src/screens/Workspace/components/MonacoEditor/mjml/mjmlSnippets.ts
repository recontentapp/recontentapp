interface MJMLSnippet {
  label: string
  value: string
}

const tags = [
  'mjml',
  'mj-head',
  'mj-body',
  'mj-include',
  'mj-attributes',
  'mj-breakpoint',
  'mj-font',
  'mj-html-attributes',
  'mj-preview',
  'mj-style',
  'mj-title',
  'mj-accordion',
  'mj-accordion-element',
  'mj-accordion-title',
  'mj-accordion-text',
  'mj-button',
  'mj-carousel',
  'mj-carousel-image',
  'mj-column',
  'mj-divider',
  'mj-group',
  'mj-hero',
  'mj-image',
  'mj-navbar',
  'mj-navbar-link',
  'mj-raw',
  'mj-section',
  'mj-social',
  'mj-spacer',
  'mj-table',
  'mj-text',
  'mj-wrapper',
]

export const snippets: MJMLSnippet[] = tags.map(t => ({
  label: t,
  value: `<${t}>$0</${t}>`,
}))
