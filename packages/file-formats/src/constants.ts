import { FileFormat } from './types'

export const fileFormats: FileFormat[] = [
  'json',
  'nested-json',
  'yaml',
  'nested-yaml',
  'excel',
  'csv',
  'android-xml',
  'apple-strings',
  'php-arrays',
]

export const fileFormatContentTypes: Record<FileFormat, string> = {
  json: 'application/json',
  'nested-json': 'application/json',
  yaml: 'application/yaml',
  'nested-yaml': 'application/yaml',
  excel: 'application/vnd.ms-excel',
  csv: 'text/csv',
  'android-xml': 'application/xml',
  'apple-strings': 'text/plain',
  'php-arrays': 'text/plain',
}

export const fileFormatExtensions: Record<FileFormat, string> = {
  yaml: '.yml',
  'nested-yaml': '.yml',
  json: '.json',
  'nested-json': '.json',
  excel: '.xlsx',
  csv: '.csv',
  'android-xml': '.xml',
  'apple-strings': '.strings',
  'php-arrays': '.php',
}
