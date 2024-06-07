import { Box, GlobalStyles, Toast } from 'design-system'
import { BridgeProvider } from './contexts/Bridge'
import { CurrentCredentialsProvider } from './contexts/CurrentCredentials'
import { File } from './screens/File/index'
import { normalize } from './theme'

export const App = () => {
  normalize()

  return (
    <BridgeProvider>
      <GlobalStyles />
      <Toast />

      <Box flexDirection="column" minHeight="100vh" backgroundColor="$white">
        <CurrentCredentialsProvider>
          <File />
        </CurrentCredentialsProvider>
      </Box>
    </BridgeProvider>
  )
}
