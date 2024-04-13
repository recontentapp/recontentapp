import { Components } from '../../../../generated/typeDefinitions'
import { CSVPreviewData, ExcelSheetPreviewData } from '../../../../utils/files'

export interface State {
  file?: File
  fileFormat: Components.Schemas.FileFormat
  language?: {
    name: string
    id: string
  }
  tagIds: string[]
  csvPreviewData?: CSVPreviewData
  excelPreviewData?: ExcelSheetPreviewData[]
  mapping?: {
    sheetName: string | undefined
    rowStartIndex: number
    keyColumnIndex: number
    translationColumnIndex: number
  }
}
