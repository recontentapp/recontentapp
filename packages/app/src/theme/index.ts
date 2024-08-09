import { createStitches } from '@stitches/react'
import { theme as customTheme, medias } from 'design-system'

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
    marginY: (value: string | number) => ({
      marginTop: value,
      marginBottom: value,
    }),
    marginX: (value: string | number) => ({
      marginLeft: value,
      marginRight: value,
    }),
    paddingY: (value: string | number) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    paddingX: (value: string | number) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
  },
  theme: customTheme,
  media: medias,
})

export const normalize = globalCss({
  '*': {
    fontFamily: customTheme.fonts.untitled,
    boxSizing: 'border-box',
  },
  body: {
    lineHeight: '1',
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
  '[data-resize-handle]': {
    position: 'relative',
    backgroundColor: 'transparent',
    '&:hover': {
      '&::after': {
        backgroundColor: '$gray8',
      },
    },
    '&[data-resize-handle-state="drag"]': {
      '&::after': {
        backgroundColor: '$gray9',
      },
    },
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      width: 2,
      height: '100%',
      top: 0,
      bottom: 0,
      left: '50%',
      backgroundColor: '$gray7',
      transition: 'background-color 0.3s',
      opacity: 0.5,
    },
  },
})
