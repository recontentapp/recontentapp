import { useCallback } from 'react'
import { useGetReferenceableAccounts } from '../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../hooks/workspace'

export const useReferenceableAccounts = () => {
  const { id } = useCurrentWorkspace()
  const { data } = useGetReferenceableAccounts(
    {
      queryParams: { workspaceId: id },
    },
    { staleTime: Infinity },
  )

  const getName = useCallback(
    (accountId: string) => {
      if (!data) {
        return 'Loading...'
      }

      return data.accounts[accountId] ?? 'Unknown'
    },
    [data],
  )

  return {
    getName,
  }
}
