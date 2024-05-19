import { Stack, Text } from 'design-system'
import { useCurrentCredentials } from '../contexts/CurrentCredentials'
import { useGetMe } from '../generated/reactQuery'

export const CredentialsFooter = () => {
  const { currentCredentials, requestSelect } = useCurrentCredentials()
  const { data } = useGetMe({
    staleTime: 1000 * 60 * 60 * 24,
  })

  if (!data) {
    return null
  }

  return (
    <Stack direction="row">
      <Text size="$size60" color="$gray11">
        Logged in as {data.firstName} {data.lastName} ({data.workspace.key}{' '}
        {currentCredentials.customOrigin})
      </Text>

      <button onClick={requestSelect}>Change</button>
    </Stack>
  )
}
