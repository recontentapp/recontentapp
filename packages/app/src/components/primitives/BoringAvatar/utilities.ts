export const DEFAULT_COLORS = [
  '#92A1C6',
  '#146A7C',
  '#F0AB3D',
  '#C271B4',
  '#C20D90',
]

export const getNumber = (name: string) => {
  const charactersArray = Array.from(name)
  let charactersCodesSum = 0

  charactersArray.forEach(charactersArrayItem => {
    return (charactersCodesSum += charactersArrayItem.charCodeAt(0))
  })

  return charactersCodesSum
}

export const getModulus = (num: number, max: number) => {
  return num % max
}

export const getDigit = (number: number, ntn: number) => {
  return Math.floor((number / Math.pow(10, ntn)) % 10)
}

export const getBoolean = (number: number, ntn: number) => {
  return !(getDigit(number, ntn) % 2)
}

export const getAngle = (x: number, y: number) => {
  return (Math.atan2(y, x) * 180) / Math.PI
}

export const getUnit = (number: number, range: number, index?: number) => {
  const value = number % range

  if (index && getDigit(number, index) % 2 === 0) {
    return -value
  } else return value
}

export const getRandomColor = (
  number: number,
  colors: string[],
  range: number,
) => {
  return colors[number % range]
}

export const getContrast = (hexcolor: string) => {
  // If a leading # is provided, remove it
  if (hexcolor.slice(0, 1) === '#') {
    hexcolor = hexcolor.slice(1)
  }

  // Convert to RGB value
  const r = parseInt(hexcolor.substr(0, 2), 16)
  const g = parseInt(hexcolor.substr(2, 2), 16)
  const b = parseInt(hexcolor.substr(4, 2), 16)

  // Get YIQ ratio
  const yiq = (r * 299 + g * 587 + b * 114) / 1000

  // Check contrast
  return yiq >= 128 ? 'black' : 'white'
}
