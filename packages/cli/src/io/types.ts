export type Data = Record<string, string>

export type Format = 'json' | 'nested-json' | 'yaml' | 'nested-yaml'

export type Formatter = (data: Data) => string
