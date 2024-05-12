import { useContext } from './context'
import { Credentials } from './screens/Credentials/Credentials'
import { APIClientProvider } from './generated/reactQuery'
import { useMemo, useState } from 'react'
import { Welcome } from './screens/Welcome'

const AuthenticatedAppWrapper = () => {
  return (
    <APIClientProvider
      config={{
        baseUrl: '',
        headers: {
          Authorization: '',
        },
      }}
    >
      <div />
    </APIClientProvider>
  )
}

export const App = () => {
  const [acceptedWelcome, setAcceptedWelcome] = useState(false)
  const { fileConfig, userConfig } = useContext()

  const hasCredentialsForFile = useMemo(() => {
    if (!userConfig) {
      return false
    }

    if (fileConfig) {
      if (fileConfig.customOrigin) {
        return userConfig.credentials.some(
          c => c.customOrigin === fileConfig.customOrigin,
        )
      }

      return userConfig.credentials.some(c => c.customOrigin === null)
    }

    return userConfig.credentials.length > 0
  }, [fileConfig, userConfig])

  if (!userConfig && !acceptedWelcome) {
    return <Welcome onGetStarted={() => setAcceptedWelcome(true)} />
  }

  if (!hasCredentialsForFile) {
    return <Credentials />
  }

  return <AuthenticatedAppWrapper />
}
