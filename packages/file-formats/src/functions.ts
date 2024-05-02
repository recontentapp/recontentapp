import { FileFormat } from './types'

export const isValidFileFormat = (format: string): format is FileFormat => {
  return ['json', 'nested-json', 'yaml', 'nested-yaml'].includes(format)
}
