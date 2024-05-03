import { Dict, Parser } from '../../types'

type CustomDict = Record<
  string,
  {
    value: string
    comment: string
  }
>

// Inspired from https://github.com/iteufel/node-strings-file
const parse = (data: string) => {
  if (data.indexOf('\n') === -1) {
    data += '\n'
  }
  const re = /(?:\/\*(.+)\*\/\n)?(.+)\s*\=\s*\"(.+)\"\;\n/gim
  const res: CustomDict = {}
  let m

  while ((m = re.exec(data)) !== null) {
    if (m.index === re.lastIndex) {
      re.lastIndex++
    }

    if (m[2].substring(0, 1) == '"') {
      m[2] = m[2].trim().slice(1, -1)
    }

    res[m[2]] = {
      value: unescapeString(m[3]),
      comment: m[1] || '',
    }
  }

  return res
}

const unescapeString = (str: string) => {
  return str.replace(/\\\"/gim, '"')
}

export const parseAppleStrings: Parser = data => {
  const result = parse(data.toString())

  return Promise.resolve(
    Object.entries(result).reduce<Dict>((acc, [key, value]) => {
      acc[key] = value.value
      return acc
    }, {}),
  )
}
