import { AsciiTable3 } from 'ascii-table3'

interface RenderTableParams {
  headers: string[]
  rows: string[][]
}

export const renderTable = ({ headers, rows }: RenderTableParams) => {
  const table = new AsciiTable3().setHeading(...headers).setStyle('compact')

  rows.forEach(row => {
    table.addRow(...row)
  })

  console.log(table.toString())
}
