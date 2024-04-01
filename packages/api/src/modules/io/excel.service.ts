import { BadRequestException, Injectable } from '@nestjs/common'
import * as Excel from 'exceljs'
import { Data } from './types'
import { escapeForExcel } from 'src/utils/security'

interface ParseParams {
  buffer: Buffer
  sheetName: string
  rowStartIndex: number
  keyColumnIndex: number
  translationColumnIndex: number
}

@Injectable()
export class ExcelService {
  async parse({
    buffer,
    sheetName,
    rowStartIndex,
    keyColumnIndex,
    translationColumnIndex,
  }: ParseParams): Promise<Data> {
    const workbook = new Excel.Workbook()

    await workbook.xlsx.load(buffer).catch(() => {
      throw new BadRequestException('Invalid excel file')
    })

    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) {
      throw new BadRequestException('Invalid sheet name')
    }

    const data: Data = {}

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < rowStartIndex) {
        return
      }

      const key = row.getCell(keyColumnIndex + 1).text
      const translation = row.getCell(translationColumnIndex + 1).text

      data[key] = translation
    })

    return data
  }

  async render(data: Data): Promise<Buffer> {
    const workbook = new Excel.Workbook()
    const sheet = workbook.addWorksheet('Translations')

    sheet.addRow(['Key', 'Translation'])

    Object.entries(data).forEach(([key, translation]) => {
      sheet.addRow([escapeForExcel(key), escapeForExcel(translation)])
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer as Buffer
  }
}
