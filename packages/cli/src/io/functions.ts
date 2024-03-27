import { Format } from './types'

export const isValidFormat = (format: string): format is Format => {
  return ['json', 'nested-json'].includes(format)
}
