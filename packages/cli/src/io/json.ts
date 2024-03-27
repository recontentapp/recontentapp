import { Data } from './types'

const json = (data: Data): string => {
  return JSON.stringify(data, null, 2)
}

export default json
