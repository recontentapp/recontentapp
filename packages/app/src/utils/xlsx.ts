import { read as readXlsx } from 'xlsx'
import { ExcelSheetPreviewData } from './files'

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

export const getExcelPreviewData = (
  file: File,
): Promise<ExcelSheetPreviewData[]> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.addEventListener('load', e => {
      const workbook = readXlsx(e.target?.result, {
        type: 'binary',
      })

      const sheetNames = workbook.SheetNames

      resolve(
        sheetNames.map(name => {
          const sheet = workbook.Sheets[name]
          const rows: string[][] = []

          for (let i = 0; i < 10; i++) {
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
