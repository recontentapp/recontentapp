import { Box, MinimalButton, Stack, Text } from 'design-system'
import { useCurrentCredentials } from '../contexts/CurrentCredentials'
import { useGetMe } from '../generated/reactQuery'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export const CREDENTIALS_FOOTER_HEIGHT = 36

export const CredentialsFooter = () => {
  const queryClient = useQueryClient()
  const { currentCredentials, requestSelect } = useCurrentCredentials()
  const { data } = useGetMe({
    staleTime: 1000 * 60 * 60 * 24,
  })

  useEffect(() => {
    queryClient.resetQueries()
  }, [queryClient, currentCredentials])

  if (!data) {
    return null
  }

  return (
    <Box
      position="sticky"
      bottom={0}
      width="100%"
      height={CREDENTIALS_FOOTER_HEIGHT}
      backgroundColor="$gray3"
      paddingX="$space80"
    >
      <Stack
        width="100%"
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="column" spacing="$space20">
          <Text size="$size40" color="$gray9">
            Logged in as {data.firstName} {data.lastName}
          </Text>

          <Text size="$size40" color="$gray9">
            {currentCredentials.workspaceKey} (
            {currentCredentials.customOrigin ?? 'Recontent.app'})
          </Text>
        </Stack>

        <MinimalButton
          size="xsmall"
          variation="primary"
          onAction={requestSelect}
        >
          Switch
        </MinimalButton>
      </Stack>
    </Box>
  )
}
