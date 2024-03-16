import { useCallback } from 'react'

export const useReferenceableAccounts = () => {
  const getName = useCallback((_accountId: string) => {
    return 'Loading...'
  }, [])

  return {
    getName,
  }
}
