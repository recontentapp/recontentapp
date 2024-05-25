import { QueryClientProvider } from '@tanstack/react-query'
import { useMemo, useRef } from 'react'

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
import { UpsellModal, UpsellModalRef } from './components/UpsellModal'

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
  const upsellModalRef = useRef<UpsellModalRef>(null!)

  normalize()

  const apiClientProviderConfig = useMemo(
    () => ({
      baseUrl: import.meta.env.VITE_APP_API_URL,
      headers: {
        ...(accessToken && {
          Authorization: `Bearer ${accessToken}`,
        }),
      },
      onError: (error: unknown) => {
        if (!(error instanceof HTTPRequestError)) {
          return
        }

        const isAuthenticationIssue = error.statusCode === 401
        const isUpsellIssue = error.statusCode === 418

        if (isUpsellIssue) {
          upsellModalRef.current?.open()
        }

        if (isAuthenticationIssue) {
          signOut()
        }
      },
    }),
    [accessToken, signOut],
  )

  if (status === 'loading') {
    return <FullpageSpinner variation="primary" />
  }

  if (status === 'authenticated') {
    return (
      <APIClientProvider config={apiClientProviderConfig}>
        <QueryClientProvider client={queryClient}>
          <CurrentWorkspaceProvider>
            <UpsellModal ref={upsellModalRef} />
            <AuthenticatedApp />
          </CurrentWorkspaceProvider>
        </QueryClientProvider>
      </APIClientProvider>
    )
  }

  return <Public />
}
