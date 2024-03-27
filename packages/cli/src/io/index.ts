import json from './json'
import nestedJson from './nestedJson'
export type { Data } from './types'

const io = {
  json: json,
  'nested-json': nestedJson,
}

export default io
