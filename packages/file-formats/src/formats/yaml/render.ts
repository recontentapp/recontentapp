import { stringify as yamlStringify } from 'yaml'
import { Renderer } from '../../types'

export const renderYAML: Renderer = data => {
  return Promise.resolve(Buffer.from(yamlStringify(data)))
}

export const renderNestedYAML: Renderer = data => {
  const obj = Object.keys(data).reduce((result, key) => {
    key.split('.').reduce((res, k, i, arr) => {
      // @ts-expect-error TODO
      return res[k] || (res[k] = arr.length - 1 === i ? data[key] : {})
    }, result)
    return result
  }, {})

  return Promise.resolve(Buffer.from(yamlStringify(obj)))
}
