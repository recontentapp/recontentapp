import { Renderer } from '../../types'

export const renderJSON: Renderer = data => {
  return Promise.resolve(Buffer.from(JSON.stringify(data, null, 2)))
}

export const renderNestedJSON: Renderer = data => {
  const obj = Object.keys(data).reduce((result, key) => {
    key.split('.').reduce((res, k, i, arr) => {
      // @ts-expect-error TODO
      return res[k] || (res[k] = arr.length - 1 === i ? data[key] : {})
    }, result)

    return result
  }, {})

  return Promise.resolve(Buffer.from(JSON.stringify(obj, null, 2)))
}
