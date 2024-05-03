import { FileFormat } from './types'

export const fileFormats: FileFormat[] = [
  'json',
  'nested_json',
  'yaml',
  'nested_yaml',
  'excel',
  'csv',
  'android_xml',
  'apple_strings',
  'php_arrays',
]

export const fileFormatContentTypes: Record<FileFormat, string> = {
  json: 'application/json',
  nested_json: 'application/json',
  yaml: 'application/yaml',
  nested_yaml: 'application/yaml',
  excel: 'application/vnd.ms-excel',
  csv: 'text/csv',
  android_xml: 'application/xml',
  apple_strings: 'text/plain',
  php_arrays: 'text/plain',
}

export const fileFormatExtensions: Record<FileFormat, string> = {
  yaml: '.yml',
  nested_yaml: '.yml',
  json: '.json',
  nested_json: '.json',
  excel: '.xlsx',
  csv: '.csv',
  android_xml: '.xml',
  apple_strings: '.strings',
  php_arrays: '.php',
}
