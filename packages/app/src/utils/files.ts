import papaparse from 'papaparse'
import * as xlsx from 'xlsx'
import { Components } from '../generated/typeDefinitions'

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

const PREVIEW_ROWS_COUNT = 10
const LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]

export type CSVPreviewData = string[][]

export const getCSVPreviewData = (file: File): Promise<CSVPreviewData> => {
  return new Promise((resolve, reject) => {
    papaparse.parse<string[]>(file, {
      error: error => {
        reject(error)
      },
      complete: result => {
        resolve(result.data.slice(0, PREVIEW_ROWS_COUNT))
      },
    })
  })
}

export interface ExcelSheetPreviewData {
  name: string
  data: string[][]
}

export const getExcelPreviewData = (
  file: File,
): Promise<ExcelSheetPreviewData[]> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.addEventListener('load', e => {
      const workbook = xlsx.read(e.target?.result, {
        type: 'binary',
      })

      const sheetNames = workbook.SheetNames

      resolve(
        sheetNames.map(name => {
          const sheet = workbook.Sheets[name]
          const rows: string[][] = []

          for (let i = 0; i < PREVIEW_ROWS_COUNT; i++) {
            const row: string[] = []
            for (const letter of LETTERS) {
              const cell = `${letter}${i + 1}`

              if (!(cell in sheet) || !('v' in sheet[cell])) {
                break
              }

              row.push(sheet[cell].v)
            }

            if (row.length === 0) {
              break
            }

            rows.push(row)
          }

          return {
            name,
            data: rows,
          }
        }),
      )
    })

    fileReader.addEventListener('error', () => {
      reject()
    })

    fileReader.readAsBinaryString(file)
  })
}

export const fileFormatAccept: Record<string, string[]> = {
  'application/json': ['.json'],
  'application/yaml': ['.yaml', '.yml'],
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
}

export const fileFormatContentType: Record<
  Components.Schemas.FileFormat,
  string[]
> = {
  json: ['application/json'],
  nested_json: ['application/json'],
  yaml: ['application/yaml'],
  nested_yaml: ['application/yaml'],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  csv: ['text/csv'],
}

export const getFileType = (
  file: File,
): Components.Schemas.FileFormat | null => {
  switch (file.type) {
    case 'application/json':
      return 'json'
    case 'application/yaml':
    case 'application/yml':
      return 'yaml'
  }

  if (fileFormatContentType.csv.includes(file.type)) {
    return 'csv'
  }

  if (fileFormatContentType.excel.includes(file.type)) {
    return 'excel'
  }

  const nameParts = file.name.split('.')
  const extension = nameParts[nameParts.length - 1]

  switch (extension) {
    case 'csv':
      return 'csv'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'json':
      return 'json'
    case 'xlsx':
      return 'excel'
  }

  return null
}
