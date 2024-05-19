import { Box, Stack, Spinner, Text } from 'design-system'

export const Loader = () => {
  return (
    <Box width="100%" height="80vh" alignItems="center" justifyContent="center">
      <Stack alignItems="center" direction="column" spacing="$space80">
        <Spinner size={32} color="$purple800" />
        <Text color="$gray11" size="$size80">
          Sync in progress
        </Text>
      </Stack>
    </Box>
  )
}
