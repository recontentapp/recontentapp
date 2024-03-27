export type Data = Record<string, string>

export type Format = 'json' | 'nested-json'

export type Formatter = (data: Data) => string
