import { useCallback } from 'react'

export function debounce<T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  wait: number,
) {
  let timer: NodeJS.Timeout

  return (...args: T): Promise<U> => {
    clearTimeout(timer)
    return new Promise(resolve => {
      timer = setTimeout(() => resolve(callback(...args)), wait)
    })
  }
}

export const useDebounce = <T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  wait: number,
) => {
  return useCallback(debounce(callback, wait), [callback])
}
