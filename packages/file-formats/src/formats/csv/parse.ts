import { parse as csvParse } from 'papaparse'
import { Dict, Parser } from '../../types'
import { DELIMITER } from './constants'

export const parseCSV: Parser = buffer => {
  const { data, errors } = csvParse(buffer.toString(), {
    header: false,
    delimiter: DELIMITER,
  })

  if (errors.length > 0) {
    return Promise.reject(new Error('Invalid CSV'))
  }

  const result = data.reduce<Dict>((result, row) => {
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

  return Promise.resolve(result)
}
