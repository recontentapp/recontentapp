import { BadRequestException, Injectable } from '@nestjs/common'
import { Data } from './types'
import { parse as yamlParse, stringify as yamlStringify } from 'yaml'

@Injectable()
export class YAMLService {
  private static flattenObject(
    obj: any,
    parent: string = '',
    result: Record<string, string> = {},
  ): Record<string, string> {
    for (const key in obj) {
      const propName = parent ? `${parent}.${key}` : key

      if (typeof obj[key] == 'object') {
        YAMLService.flattenObject(obj[key], propName, result)
      } else {
        result[propName] = String(obj[key])
      }
    }

    return result
  }

  parse(buffer: Buffer): Data {
    let content: object = {}

    try {
      content = yamlParse(buffer.toString())
    } catch (e) {
      throw new BadRequestException('Invalid JSON')
    }

    return YAMLService.flattenObject(content)
  }

  render(data: Data): Buffer {
    return Buffer.from(yamlStringify(data))
  }

  renderNested(data: Data): Buffer {
    const obj = Object.keys(data).reduce((result, key) => {
      key.split('.').reduce((res, k, i, arr) => {
        // @ts-expect-error TODO
        return res[k] || (res[k] = arr.length - 1 === i ? data[key] : {})
      }, result)
      return result
    }, {})

    return Buffer.from(yamlStringify(obj))
  }
}
