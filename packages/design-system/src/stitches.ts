import { createStitches } from '@stitches/react'
import { theme as customTheme, medias } from './theme'

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
