import { theme } from 'design-system'
import { useCallback } from 'react'
import {
  useGetReferenceableAccounts,
  useGetReferenceableTags,
} from '../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../hooks/workspace'

export const useReferenceableTags = (projectId: string) => {
  const { data } = useGetReferenceableTags(
    {
      queryParams: { projectId },
    },
    { staleTime: Infinity },
  )

  const get = useCallback(
    (tagId: string) => {
      if (!data) {
        return {
          label: 'Loading...',
          color: theme.colors.gray1,
        }
      }

      return (
        data.tags[tagId] ?? {
          label: 'Unknown',
          color: theme.colors.gray1,
        }
      )
    },
    [data],
  )

  return {
    get,
  }
}

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
