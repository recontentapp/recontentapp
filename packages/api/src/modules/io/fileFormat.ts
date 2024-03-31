import { Components } from 'src/generated/typeDefinitions'

export const isValidFileFormat = (
  format: string,
): format is Components.Schemas.FileFormat => {
  return [
    'json',
    'yaml',
    'nested_json',
    'nested_yaml',
    'excel',
    'csv',
  ].includes(format)
}

export const fileFormatContentType: Record<
  Components.Schemas.FileFormat,
  string
> = {
  json: 'application/json',
  nested_json: 'application/json',
  yaml: 'application/yaml',
  nested_yaml: 'application/yaml',
  excel: 'application/vnd.ms-excel',
  csv: 'text/csv',
}

export const fileFormatExtensions: Record<
  Components.Schemas.FileFormat,
  string
> = {
  json: '.json',
  nested_json: '.json',
  yaml: '.yaml',
  nested_yaml: '.yaml',
  excel: '.xlsx',
  csv: '.csv',
}
