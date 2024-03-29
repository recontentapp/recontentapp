import { BadRequestException, Injectable } from '@nestjs/common'
import { Data } from './types'

@Injectable()
export class JSONService {
  private static flattenObject(
    obj: any,
    parent: string = '',
    result: Record<string, string> = {},
  ): Record<string, string> {
    for (const key in obj) {
      const propName = parent ? `${parent}.${key}` : key

      if (typeof obj[key] == 'object') {
        JSONService.flattenObject(obj[key], propName, result)
      } else {
        result[propName] = String(obj[key])
      }
    }

    return result
  }

  parse(buffer: Buffer): Data {
    let content: object = {}

    try {
      content = JSON.parse(buffer.toString())
    } catch (e) {
      throw new BadRequestException('Invalid JSON')
    }

    return JSONService.flattenObject(content)
  }

  render(data: Data): Buffer {
    return Buffer.from(JSON.stringify(data, null, 2))
  }

  renderNested(data: Data): Buffer {
    const obj = Object.keys(data).reduce((result, key) => {
      key.split('.').reduce((res, k, i, arr) => {
        // @ts-expect-error TODO
        return res[k] || (res[k] = arr.length - 1 === i ? data[key] : {})
      }, result)
      return result
    }, {})

    return Buffer.from(JSON.stringify(obj, null, 2))
  }
}
