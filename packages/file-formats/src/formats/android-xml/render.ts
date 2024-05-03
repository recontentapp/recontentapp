import { XMLBuilder } from 'fast-xml-parser'
import { Renderer } from '../../types'
import { ATTRIBUTE_NAME_PREFIX, TEXT_NODE_NAME } from './constants'

export const renderAndroidXML: Renderer = data => {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    textNodeName: TEXT_NODE_NAME,
    attributeNamePrefix: ATTRIBUTE_NAME_PREFIX,
  })

  const formattedData = {
    '?xml': {
      '@@version': '1.0',
      '@@encoding': 'utf-8',
    },
    resources: {
      string: Object.entries(data).map(([key, value]) => ({
        '@@name': key,
        [TEXT_NODE_NAME]: value,
      })),
    },
  }

  const result = builder.build(formattedData)

  return Promise.resolve(Buffer.from(result))
}
