import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useBridge } from './Bridge'
import { APIClientProvider } from '../generated/reactQuery'
import { getURLs } from '../utils/origins'
import { Welcome } from '../screens/Onboarding/screens/Welcome'
import { CredentialsForm } from '../components/CredentialsForm/CredentialsForm'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../queryClient'
import { UserCredentials } from '../../../shared-types'
import { SelectCredentials } from '../components/SelectCredentials'
import { CredentialsAreInvalidForFile } from '../components/CredentialsAreInvalidForFile'
import {
  CREDENTIALS_FOOTER_HEIGHT,
  CredentialsFooter,
} from '../components/CredentialsFooter'
import { Box, Stack } from 'design-system'

interface CurrentCredentialsProviderProps {
  children: ReactNode
}

interface CurrentCredentials {
  currentCredentials: UserCredentials
  requestUpdate: () => void
  requestSelect: () => void
}

const context = createContext<CurrentCredentials>(null!)

export const useCurrentCredentials = () => useContext(context)

export const CurrentCredentialsProvider = ({
  children,
}: CurrentCredentialsProviderProps) => {
  const { fileConfig, userConfig } = useBridge()

  const [acceptedWelcome, setAcceptedWelcome] = useState(false)
  const [requestedSelect, setRequestedSelect] = useState(false)
  const [requestedUpdate, setRequestedUpdate] = useState(false)

  const [currentCredentials, setCurrentCredentials] =
    useState<UserCredentials | null>(null)

  useEffect(() => {
    if (currentCredentials) {
      return
    }

    if (fileConfig === null && userConfig?.credentials.length === 1) {
      setCurrentCredentials(userConfig.credentials[0])
      return
    }

    if (fileConfig && userConfig) {
      const matchingCredentials = userConfig.credentials.find(
        c =>
          c.customOrigin === fileConfig.customOrigin &&
          c.workspaceId === fileConfig.workspaceId,
      )
      if (matchingCredentials) {
        setCurrentCredentials(matchingCredentials)
        return
      }
    }
  }, [currentCredentials, fileConfig, userConfig])

  const shouldBeWelcomed =
    (!userConfig || userConfig.credentials.length === 0) && !acceptedWelcome

  if (shouldBeWelcomed) {
    return <Welcome onGetStarted={() => setAcceptedWelcome(true)} />
  }

  const userHasNoCredentials =
    !userConfig || userConfig.credentials.length === 0

  if (userHasNoCredentials || requestedUpdate) {
    return (
      <CredentialsForm
        isOnboarding={userHasNoCredentials}
        onUpdate={() => setRequestedUpdate(false)}
      />
    )
  }

  if (!currentCredentials || requestedSelect) {
    return (
      <SelectCredentials
        onUpdate={() => setRequestedUpdate(true)}
        onSelect={credentials => {
          setCurrentCredentials(credentials)
          setRequestedSelect(false)
        }}
      />
    )
  }

  const fileNotConfigured = fileConfig === null
  const currentCredentialsMatchFileConfig =
    fileConfig?.customOrigin === currentCredentials.customOrigin &&
    fileConfig.workspaceId === currentCredentials.workspaceId
  const credentialsValidForFile =
    fileNotConfigured || currentCredentialsMatchFileConfig

  if (!credentialsValidForFile) {
    return (
      <CredentialsAreInvalidForFile onSelect={() => setRequestedSelect(true)} />
    )
  }

  return (
    <context.Provider
      value={{
        currentCredentials,
        requestUpdate: () => setRequestedUpdate(true),
        requestSelect: () => setRequestedSelect(true),
      }}
    >
      <APIClientProvider
        config={{
          baseUrl: getURLs(currentCredentials.customOrigin).api,
          headers: {
            Authorization: `Bearer ${currentCredentials.apiKey}`,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <Stack width="100%" direction="column" spacing="$space0">
            <Box
              flexDirection="column"
              minHeight={`calc(100vh - ${CREDENTIALS_FOOTER_HEIGHT}px)`}
            >
              {children}
            </Box>

            <CredentialsFooter />
          </Stack>
        </QueryClientProvider>
      </APIClientProvider>
    </context.Provider>
  )
}
