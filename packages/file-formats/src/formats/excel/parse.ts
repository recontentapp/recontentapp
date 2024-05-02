import * as Excel from 'exceljs'
import { Dict, Parser } from '../../types'

export interface ExcelParserOptions {
  sheetName: string
  rowStartIndex: number
  keyColumnIndex: number
  translationColumnIndex: number
}

const defaultOptions: ExcelParserOptions = {
  sheetName: '',
  rowStartIndex: 0,
  keyColumnIndex: 0,
  translationColumnIndex: 0,
}

export const parseExcel: Parser<ExcelParserOptions> = async (
  buffer,
  options,
) => {
  const { sheetName, rowStartIndex, keyColumnIndex, translationColumnIndex } =
    options ?? defaultOptions

  const workbook = new Excel.Workbook()

  const loadResult = await workbook.xlsx.load(buffer).catch(() => {
    return null
  })
  if (!loadResult) {
    return Promise.reject(new Error('Invalid Excel file'))
  }

  const sheet = workbook.getWorksheet(sheetName)
  if (!sheet) {
    return Promise.reject(new Error('Invalid sheet name'))
  }

  const data: Dict = {}

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < rowStartIndex) {
      return
    }

    const key = row.getCell(keyColumnIndex + 1).text
    const translation = row.getCell(translationColumnIndex + 1).text

    data[key] = translation
  })

  return Promise.resolve(data)
}
