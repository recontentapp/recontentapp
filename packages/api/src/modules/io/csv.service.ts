import { BadRequestException, Injectable } from '@nestjs/common'
import { parse as csvParse } from 'papaparse'
import { Data } from './types'

@Injectable()
export class CSVService {
  parse(buffer: Buffer): Data {
    const { data, errors } = csvParse(buffer.toString(), {
      header: false,
      delimiter: ',',
    })

    if (errors.length > 0) {
      throw new BadRequestException('Invalid CSV')
    }

    return data.reduce<Data>((result, row) => {
      if (!Array.isArray(row) || typeof row !== 'object' || row.length !== 2) {
        return result
      }

      const [key, value] = row

      if (typeof key !== 'string') {
        return result
      }

      result[key] = String(value)

      return result
    }, {})
  }

  render(data: Data): Buffer {
    const csv = Object.entries(data).reduce<string>((result, [key, value]) => {
      return `${result}${key},${value}\n`
    }, '')

    return Buffer.from(csv)
  }
}
