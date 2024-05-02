import { parse as yamlParse } from 'yaml'
import { Parser } from '../../types'

const flattenObject = (
  obj: any,
  parent: string = '',
  result: Record<string, string> = {},
): Record<string, string> => {
  for (const key in obj) {
    const propName = parent ? `${parent}.${key}` : key

    if (typeof obj[key] == 'object') {
      flattenObject(obj[key], propName, result)
    } else {
      result[propName] = String(obj[key])
    }
  }

  return result
}

export const parseYAML: Parser = data => {
  let content: object = {}

  try {
    content = yamlParse(data.toString())
  } catch (e) {
    return Promise.reject(new Error('Invalid JSON'))
  }

  return Promise.resolve(flattenObject(content))
}
