export type Dict = Record<string, string>

export type FileFormat =
  | 'json'
  | 'nested_json'
  | 'yaml'
  | 'nested_yaml'
  | 'csv'
  | 'excel'
  | 'apple_strings'
  | 'android_xml'
  | 'php_arrays'

export type Renderer = (data: Dict) => Promise<Buffer>

export type Parser<T = Record<string, never>> = (
  data: Buffer,
  options?: T,
) => Promise<Dict>
