import { Box, GlobalStyles, Toast } from 'design-system'
import { normalize } from './theme'
import { BridgeProvider } from './contexts/Bridge'
import { CurrentCredentialsProvider } from './contexts/CurrentCredentials'
import { File } from './screens/File/index'

export const App = () => {
  normalize()

  return (
    <BridgeProvider>
      <GlobalStyles />
      <Toast />

      <Box minHeight="100vh" backgroundColor="$white">
        <CurrentCredentialsProvider>
          <File />
        </CurrentCredentialsProvider>
      </Box>
    </BridgeProvider>
  )
}
