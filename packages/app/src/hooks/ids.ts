import { useMemo } from 'react'

const globalPrefix = 'ID_'
let lastId = 0

const nextId = (): string => {
  lastId++

  return `${globalPrefix}${lastId}`
}

/**
 * Uses or generates a unique identifier
 * for form fields
 */
export const useId = (defaultId?: string) => {
  const id = useMemo(() => {
    if (defaultId) {
      return defaultId
    }

    return nextId()
  }, [])

  return id
}
