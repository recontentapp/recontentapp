import { useContext, Screen } from './context'
import { Main } from './screens/Main'
import { Onboarding } from './screens/Onboarding'
import { Settings } from './screens/Settings'
import { Setup } from './screens/Setup'
import { Tabs } from 'figma-ui-kit'
import { APIClientProvider } from './generated/reactQuery'
import { HTTPRequestError } from './generated/apiClient'

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

  if (!apiKey) {
    return <Onboarding />
  }

  return (
    <APIClientProvider
      config={{
        baseUrl: import.meta.env.VITE_APP_API_URL,
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        onError: error => {
          if (
            error instanceof HTTPRequestError &&
            [401, 403].includes(error.statusCode)
          ) {
            resetAPIKey()
          }
        },
      }}
    >
      <AuthenticatedApp />
    </APIClientProvider>
  )
}
