import { FileFormat } from './types'

export const fileFormatContentTypes: Record<FileFormat, string> = {
  json: 'application/json',
  'nested-json': 'application/json',
  yaml: 'application/yaml',
  'nested-yaml': 'application/yaml',
  excel: 'application/vnd.ms-excel',
  csv: 'text/csv',
}

export const fileFormatExtensions: Record<FileFormat, string> = {
  yaml: '.yml',
  'nested-yaml': '.yml',
  json: '.json',
  'nested-json': '.json',
  excel: '.xlsx',
  csv: '.csv',
}
