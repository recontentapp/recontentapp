import { XMLParser } from 'fast-xml-parser'
import { Dict, Parser } from '../../types'
import { ATTRIBUTE_NAME_PREFIX, TEXT_NODE_NAME } from './constants'

export const parseAndroidXML: Parser = data => {
  const result: Dict = {}

  const parser = new XMLParser({
    ignoreAttributes: false,
    textNodeName: TEXT_NODE_NAME,
    attributeNamePrefix: ATTRIBUTE_NAME_PREFIX,
  })

  const json: Record<string, unknown> = parser.parse(data.toString())

  const resources = json.resources
  if (!resources || typeof resources !== 'object' || !('string' in resources)) {
    return Promise.resolve(result)
  }

  const strings = resources.string
  if (!Array.isArray(strings)) {
    return Promise.resolve(result)
  }

  for (const string of strings) {
    if (!string || typeof string !== 'object') {
      continue
    }

    const key = string[ATTRIBUTE_NAME_PREFIX + 'name']
    const value = string[TEXT_NODE_NAME]

    if (
      !key ||
      typeof key !== 'string' ||
      !value ||
      typeof value !== 'string'
    ) {
      continue
    }

    result[key] = value
  }

  return Promise.resolve(result)
}
