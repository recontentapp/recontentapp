import { createStitches } from '@stitches/react'

const customTheme = {
  colors: {
    purple900: '#3D0034',
    purple800: '#501A48',
    purple700: '#63335C',
    purple600: '#774D71',
    purple500: '#8A6685',
    purple400: '#B199AD',
    purple300: '#C5B3C2',
    purple200: '#D8CCD6',
    purple100: '#EBE6EB',
    blue900: '#007C89',
    blue800: '#1A8995',
    blue700: '#3396A0',
    blue600: '#4DA3AC',
    blue500: '#66B0B8',
    blue400: '#80BEC4',
    blue300: '#99CBD0',
    blue200: '#B2D8DC',
    blue100: '#CCE5E7',
    red100: '#e61949',
    red200: '#E8305B',
    orange50: '#FFF2E5',
    orange100: '#FFE7D1',
    orange200: '#FFD6B2',
    orange300: '#FFC28C',
    orange400: '#FFAD65',
    orange500: '#FF993F',
    orange600: '#CE7C32',
    orange700: '#9E5E26',
    orange800: '#6D4119',
    orange900: '#3D230D',
    green100: '#00894A',
    green200: '#009E55',
  },
  space: {
    space0: '0px',
    space20: '2px',
    space40: '4px',
    space60: '8px',
    space80: '12px',
    space100: '16px',
    space200: '24px',
    space300: '32px',
    space400: '40px',
    space500: '48px',
    space600: '64px',
    space700: '96px',
    space800: '120px',
    space900: '144px',
  },
  fontSizes: {
    size60: '12px',
    size80: '14px',
    size100: '16px',
    size200: '18px',
    size300: '22px',
    size400: '30px',
    size500: '40px',
    size600: '52px',
    size700: '68px',
  },
  lineHeights: {
    lineHeight100: 1,
    lineHeight200: 1.34,
    lineHeight300: 1.6,
  },
  letterSpacings: {},
  sizes: {},
  borderWidths: {},
  borderStyles: {},
  radii: {
    radius100: '3px',
    radius200: '6px',
    radius300: '8px',
    radius400: '16px',
    radius500: '32px',
  },
  shadows: {
    shadow100: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
    shadow200: '0px 3px 6px -4px rgba(0, 0, 0, 0.22)',
    shadow300: '0px 7px 14px -4px rgba(0, 0, 0, 0.14)',
    shadow400: '0px 12px 24px -6px rgba(0, 0, 0, 0.14)',
    shadow500: '0px 22px 60px -8px rgba(0, 0, 0, 0.2)',
  },
  zIndices: {},
  transitions: {},
}

export type FontSizeValue = `$${keyof typeof customTheme.fontSizes}`
export type SpaceValue = `$${keyof typeof customTheme.space}`
export type ColorValue = `$${keyof typeof customTheme.colors}`
export type LineHeightValue = `$${keyof typeof customTheme.lineHeights}`

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  utils: {
    marginY: (value: SpaceValue | string | number) => ({
      marginTop: value,
      marginBottom: value,
    }),
    marginX: (value: SpaceValue | string | number) => ({
      marginLeft: value,
      marginRight: value,
    }),
    paddingY: (value: SpaceValue | string | number) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    paddingX: (value: SpaceValue | string | number) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
  },
  theme: customTheme,
})

export const normalize = globalCss({
  '*': {
    boxSizing: 'border-box',
  },
  body: {
    lineHeight: '1',
    fontFamily: '"Inter", sans-serif;',
  },
  'html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, main, menu, nav, output, ruby, section, summary, time, mark, audio, video':
    {
      margin: '0',
      padding: '0',
      border: '0',
      fontSize: '100%',
      verticalAlign: 'baseline',
    },
  'article, aside, details, figcaption, figure, footer, header, hgroup, main, menu, nav, section':
    {
      display: 'block',
    },
  a: {
    textDecoration: 'none',
  },
  '*[hidden]': {
    display: 'none',
  },
  'ol, ul': {
    listStyle: 'none',
  },
  'blockquote, q': {
    quotes: 'none',
  },
  'blockquote:before, blockquote:after, q:before, q:after': {
    content: 'none',
  },
  table: {
    borderSpacing: '0',
  },
  button: {
    appearance: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
  },
})

export const customOutline = {
  outlineColor: theme.colors.blue900,
  outlineOffset: -0.6,
  outlineStyle: 'auto',
  outlineWidth: 2,
  boxShadow:
    'rgba(47, 78, 178, 0.9) 0px 0px 0px 1px, rgba(47, 78, 178, 0.3) 0px 0px 0px 2px',
}
