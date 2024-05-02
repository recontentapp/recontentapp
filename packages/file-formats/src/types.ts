export type Dict = Record<string, string>

export type FileFormat =
  | 'json'
  | 'nested-json'
  | 'yaml'
  | 'nested-yaml'
  | 'csv'
  | 'excel'

export type Renderer = (data: Dict) => Promise<Buffer>

export type Parser<T = Record<string, never>> = (
  data: Buffer,
  options?: T,
) => Promise<Dict>
