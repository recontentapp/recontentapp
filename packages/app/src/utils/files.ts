import papaparse from 'papaparse'
import { Components } from '../generated/typeDefinitions'

export interface ExcelSheetPreviewData {
  name: string
  data: string[][]
}

export const formatFileSize = (bytes: number) => {
  const dp = 1
  const thresh = 1000

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  )

  return bytes.toFixed(dp) + ' ' + units[u]
}

export type CSVPreviewData = string[][]

export const getCSVPreviewData = (file: File): Promise<CSVPreviewData> => {
  return new Promise((resolve, reject) => {
    papaparse.parse<string[]>(file, {
      error: error => {
        reject(error)
      },
      complete: result => {
        resolve(result.data.slice(0, 10))
      },
    })
  })
}

export const fileFormatAccept: Record<string, string[]> = {
  'text/xml': ['.xml'],
  'application/xml': ['.xml'],
  'text/plain': ['.php', '.strings'],
  'application/yaml': ['.yaml', '.yml'],
  'application/yml': ['.yaml', '.yml'],
  'application/json': ['.json'],
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    '.xlsx',
  ],
}

export const fileFormatLabels: Record<Components.Schemas.FileFormat, string> = {
  json: 'JSON',
  nested_json: 'Nested JSON',
  yaml: 'YAML',
  nested_yaml: 'Nested YAML',
  excel: 'Excel',
  csv: 'CSV',
  android_xml: 'Android XML',
  apple_strings: 'Apple Strings',
  php_arrays: 'PHP Arrays',
}

export const fileFormatContentType: Record<
  Components.Schemas.FileFormat,
  string[]
> = {
  json: ['application/json'],
  nested_json: ['application/json'],
  yaml: ['application/yaml', 'application/yml'],
  nested_yaml: ['application/yaml', 'application/yml'],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  csv: ['text/csv'],
  android_xml: ['application/xml', 'text/xml'],
  apple_strings: ['text/plain'],
  php_arrays: ['text/plain'],
}

export const getFileType = (
  file: File,
): Components.Schemas.FileFormat | null => {
  if (fileFormatContentType.json.includes(file.type)) {
    return 'json'
  }

  if (fileFormatContentType.yaml.includes(file.type)) {
    return 'yaml'
  }

  if (fileFormatContentType.excel.includes(file.type)) {
    return 'excel'
  }

  if (fileFormatContentType.csv.includes(file.type)) {
    return 'csv'
  }

  if (fileFormatContentType.android_xml.includes(file.type)) {
    return 'android_xml'
  }

  const nameParts = file.name.split('.')
  const extension = nameParts[nameParts.length - 1]

  switch (extension) {
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'json':
      return 'json'
    case 'xls':
    case 'xlsx':
      return 'excel'
    case 'csv':
      return 'csv'
    case 'xml':
      return 'android_xml'
    case 'php':
      return 'php_arrays'
    case 'strings':
      return 'apple_strings'
  }

  return null
}
