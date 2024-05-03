import { fileFormats } from './constants'
import { FileFormat } from './types'

export const isValidFileFormat = (format: string): format is FileFormat => {
  return fileFormats.map(String).includes(format)
}
