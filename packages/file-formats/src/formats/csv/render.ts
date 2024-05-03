import { Renderer } from '../../types'
import { DELIMITER } from './constants'

export const renderCSV: Renderer = data => {
  const csv = Object.entries(data).reduce<string>((result, [key, value]) => {
    return `${result}${key}${DELIMITER}${value}\n`
  }, '')

  return Promise.resolve(Buffer.from(csv))
}
