import { Renderer } from '../../types'

const escapeString = (str: string) => {
  return str.replace(/\"/gim, '\\"')
}

export const renderAppleStrings: Renderer = data => {
  const result = Object.entries(data).map(([key, value]) => {
    return `"${key}" = "${escapeString(value)}";`
  })

  return Promise.resolve(Buffer.from(result.join('\n')))
}
