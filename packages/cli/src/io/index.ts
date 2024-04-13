import json from './json'
import nestedJson from './nestedJson'
import yaml from './yaml'
import nestedYaml from './nestedYaml'
import { Format, Formatter } from './types'

export { isValidFormat } from './functions'

export const formatters: Record<Format, Formatter> = {
  yaml: yaml,
  'nested-yaml': nestedYaml,
  json: json,
  'nested-json': nestedJson,
}

export const fileExtensions: Record<Format, string> = {
  yaml: '.yml',
  'nested-yaml': '.yml',
  json: '.json',
  'nested-json': '.json',
}
