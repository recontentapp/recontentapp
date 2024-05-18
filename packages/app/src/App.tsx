import { QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useAuth, useCurrentUser } from './auth'
import { FullpageSpinner } from './components/FullpageSpinner'
import { APIClientProvider } from './generated/reactQuery'
import { Public } from './screens/Public'
import { HTTPRequestError } from './generated/apiClient'
import { queryClient } from './queryClient'
import { Onboarding } from './screens/Onboarding'
import {
  CurrentWorkspaceProvider,
  useLooseCurrentWorkspace,
} from './hooks/workspace'
import { SelectWorkspace } from './screens/SelectWorkspace'
import { Workspace } from './screens/Workspace'
import { normalize } from './theme'

const AuthenticatedApp = () => {
  const currentUser = useCurrentUser()
  const { currentWorkspace } = useLooseCurrentWorkspace()

  if (currentUser.accounts.length === 0) {
    return <Onboarding />
  }

  if (currentWorkspace === null) {
    return <SelectWorkspace />
  }

  return <Workspace />
}

export const App = () => {
  const { status, accessToken, signOut } = useAuth()
  normalize()

  const headers = useMemo(
    () => ({
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
    }),
    [accessToken],
  )

  if (status === 'loading') {
    return <FullpageSpinner variation="primary" />
  }

  if (status === 'authenticated') {
    return (
      <APIClientProvider
        config={{
          baseUrl: import.meta.env.VITE_APP_API_URL,
          headers,
          onError: error => {
            if (
              error instanceof HTTPRequestError &&
              [401, 403].includes(error.statusCode)
            ) {
              signOut()
            }
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CurrentWorkspaceProvider>
            <AuthenticatedApp />
          </CurrentWorkspaceProvider>
        </QueryClientProvider>
      </APIClientProvider>
    )
  }

  return <Public />
}
