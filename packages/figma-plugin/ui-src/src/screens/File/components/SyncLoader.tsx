import { Box, Spinner, Stack, Text } from 'design-system'
import { useEffect, useState } from 'react'

const texts = ['Fetching latest changes...', 'Applying changes...']

export const SyncLoader = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => prev + 1)
    }, 2000)

    return () => clearInterval(interval)
  })

  const text = texts[index % texts.length]

  return (
    <Box width="100%" height="80vh" alignItems="center" justifyContent="center">
      <Stack alignItems="center" direction="column" spacing="$space80">
        <Spinner size={24} color="$gray11" />
        <Text color="$gray11" size="$size60">
          {text}
        </Text>
      </Stack>
    </Box>
  )
}
