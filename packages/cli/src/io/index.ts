import json from './json'
import nestedJson from './nestedJson'
import { Format, Formatter } from './types'

export { isValidFormat } from './functions'

const io: Record<Format, Formatter> = {
  json: json,
  'nested-json': nestedJson,
}

export default io
