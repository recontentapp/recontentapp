import { QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useAuth } from './auth'
import { FullpageSpinner } from './components/FullpageSpinner'
import { APIClientProvider } from './generated/reactQuery'
import { Public } from './screens/Public'
import { normalize } from './theme'
import { HTTPRequestError } from './generated/apiClient'
import { queryClient } from './queryClient'

const AuthenticatedApp = () => {
  return <div>Authenticated</div>
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
          <AuthenticatedApp />
        </QueryClientProvider>
      </APIClientProvider>
    )
  }

  return <Public />
}
