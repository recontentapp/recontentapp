import { Data } from './types'

const nestedJson = (data: Data): string => {
  const obj = Object.keys(data).reduce((result, key) => {
    key.split('.').reduce((res, k, i, arr) => {
      // @ts-expect-error TODO
      return res[k] || (res[k] = arr.length - 1 === i ? data[key] : {})
    }, result)
    return result
  }, {})

  return JSON.stringify(obj, null, 2)
}

export default nestedJson
