import { parseYAML } from './formats/yaml/parse'
import { parseJSON } from './formats/json/parse'
import { renderJSON, renderNestedJSON } from './formats/json/render'
import { renderNestedYAML, renderYAML } from './formats/yaml/render'
import { renderExcel } from './formats/excel/render'
import { renderCSV } from './formats/csv/render'
import { parseExcel } from './formats/excel/parse'
import { parseCSV } from './formats/csv/parse'
import { FileFormat } from './types'
export { isValidFileFormat } from './functions'

export const renderers = {
  yaml: renderYAML,
  'nested-yaml': renderNestedYAML,
  json: renderJSON,
  'nested-json': renderNestedJSON,
  excel: renderExcel,
  csv: renderCSV,
}

export const parsers = {
  yaml: parseYAML,
  json: parseJSON,
  excel: parseExcel,
  csv: parseCSV,
}

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
