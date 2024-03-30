import { Components } from '../../../../generated/typeDefinitions'
import { CSVPreviewData, ExcelSheetPreviewData } from '../../../../utils/files'

export interface State {
  file?: File
  fileFormat: Components.Schemas.FileFormat
  locale?: string
  languageName?: string
  csvPreviewData?: CSVPreviewData
  excelPreviewData?: ExcelSheetPreviewData[]
  mapping?: {
    sheetIndex: number
    rowStartIndex: number
    keyColumnIndex: number | undefined
    translationColumnIndex: number | undefined
  }
}
