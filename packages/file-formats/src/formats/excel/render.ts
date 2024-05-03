import * as Excel from 'exceljs'
import { Renderer } from '../../types'
import { escape } from './functions'

export const renderExcel: Renderer = async data => {
  const workbook = new Excel.Workbook()
  const sheet = workbook.addWorksheet('Translations')

  sheet.addRow(['Key', 'Translation'])

  Object.entries(data).forEach(([key, translation]) => {
    sheet.addRow([escape(key), escape(translation)])
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer as Buffer
}
