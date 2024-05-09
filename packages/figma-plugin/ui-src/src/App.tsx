import React, { useCallback } from 'react'
import { QueryClientProvider } from 'react-query'
import { useContext, Screen } from './context'
import { queryClient } from './queryClient'
import { RequestProvider } from './request'
import { Main } from './screens/Main'
import { Onboarding } from './screens/Onboarding'
import { Settings } from './screens/Settings'
import { Setup } from './screens/Setup'
import { Error } from './request/types'
import { Tabs } from 'figma-ui-kit'
import { getAPIBaseEndpoint } from './config'

const AuthenticatedApp = () => {
  const { screen, id, updateScreen } = useContext()

  if (!id) {
    return <Setup />
  }

  return (
    <Tabs<Screen>
      value={screen}
      onValueChange={value => {
        updateScreen(value as Screen)
      }}
      options={[
        { value: 'Inspect', children: <Main /> },
        { value: 'Settings', children: <Settings /> },
      ]}
    />
  )
}

export const App = () => {
  const { apiKey, resetAPIKey } = useContext()
  const onError = useCallback((error: Error) => {
    if (error.statusCode === 401) {
      resetAPIKey()
    }
  }, [])

  if (!apiKey) {
    return <Onboarding />
  }

  return (
    <RequestProvider
      baseUrl={getAPIBaseEndpoint()}
      headers={{ Authorization: `Bearer ${apiKey}` }}
      onError={onError}
    >
      <QueryClientProvider client={queryClient}>
        <AuthenticatedApp />
      </QueryClientProvider>
    </RequestProvider>
  )
}
