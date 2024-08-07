interface MJMLSnippet {
  label: string
  value: string
}

export const snippets: MJMLSnippet[] = [
  {
    label: 'mjml',
    value: '<mjml>${0}</mjml>',
  },
  {
    label: 'mjhead',
    value: '<mj-head>${0}</mj-head>',
  },
  {
    label: 'mjbody',
    value: '<mj-body>${0}</mj-body>',
  },
  {
    label: 'mjstyle',
    value: '<mj-style>${0}</mj-style>',
  },
  {
    label: 'mjattributes',
    value: '<mj-attributes>${0}</mj-attributes>',
  },
  {
    label: 'mjtitle',
    value: '<mj-title>${0}</mj-title>',
  },
  {
    label: 'mjpreview',
    value: '<mj-preview>${0}</mj-preview>',
  },
  {
    label: 'mjfont',
    value: '<mj-font name="$1" href="$2" />',
  },
  {
    label: 'mjbutton',
    value: '<mj-button>${0}</mj-button>',
  },
  {
    label: 'mjsection',
    value: '<mj-section>${0}</mj-section>',
  },
  {
    label: 'mjcolumn',
    value: '<mj-column>${0}</mj-column>',
  },
  {
    label: 'mjdivider',
    value: '<mj-divider>${0}</mj-divider>',
  },
  {
    label: 'mjgroup',
    value: '<mj-group>${0}</mj-group>',
  },
  {
    label: 'mjhero',
    value: '<mj-hero>${0}</mj-hero>',
  },
  {
    label: 'mjtext',
    value: '<mj-text>${0}</mj-text>',
  },
  {
    label: 'mjwrapper',
    value: '<mj-wrapper>${0}</mj-wrapper>',
  },
  {
    label: 'mjimage',
    value: '<mj-image src="$1" alt="$2" />',
  },
]
