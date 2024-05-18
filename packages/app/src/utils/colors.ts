import { theme } from 'design-system'

export const getRandomHexColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

/**
 * Resolve text color based on background color
 * to ensure proper contrast
 * https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
 */
export const getColorBasedOnBackground = (bgColor: string) => {
  const lightColor = theme.colors.gray1
  const darkColor = theme.colors.gray14

  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  const rgb = [r / 255, g / 255, b / 255]

  const c = rgb.map(value => {
    if (value <= 0.03928) {
      return value / 12.92
    }
    return Math.pow((value + 0.055) / 1.055, 2.4)
  })

  const tooLight = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

  return tooLight > 0.179 ? darkColor : lightColor
}
