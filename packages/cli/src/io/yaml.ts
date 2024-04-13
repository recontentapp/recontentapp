import { stringify as yamlStringify } from 'yaml'
import { Data } from './types'

const yaml = (data: Data): string => {
  return yamlStringify(data)
}

export default yaml
