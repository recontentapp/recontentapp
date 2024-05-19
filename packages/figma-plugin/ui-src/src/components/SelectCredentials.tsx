import { Box, Button, Heading, MinimalButton, Stack, Text } from 'design-system'
import { useBridge } from '../contexts/Bridge'
import { UserCredentials } from '../../../shared-types'
import { styled } from '../theme'

interface SelectCredentialsProps {
  onSelect: (credentials: UserCredentials) => void
  onUpdate: () => void
}

const Card = styled('button', {
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  paddingY: '$space60',
  paddingX: '$space80',
  gap: '$space20',
  border: '1px solid $gray4',
  borderRadius: '$radius200',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '$gray3',
  },
})

export const SelectCredentials = ({
  onSelect,
  onUpdate,
}: SelectCredentialsProps) => {
  const { userConfig, emit } = useBridge()

  return (
    <Stack
      width="100%"
      direction="column"
      spacing="$space100"
      paddingX="$space80"
      paddingY="$space80"
      paddingBottom="$space300"
    >
      <Stack flexGrow={1} width="100%" direction="column" spacing="$space100">
        <Stack direction="column" spacing="$space20">
          <Heading renderAs="h1" color="$gray14" size="$size100">
            Switch credentials
          </Heading>

          <Text
            size="$size60"
            lineHeight="$lineHeight200"
            renderAs="span"
            color="$gray11"
          >
            Select credentials to use to continue using Recontent.app on Figma
          </Text>
        </Stack>

        <Stack width="100%" direction="column" spacing="$space80">
          {userConfig?.credentials.map(credential => (
            <Card onClick={() => onSelect(credential)}>
              <Text
                variation="bold"
                size="$size80"
                renderAs="span"
                color="$gray14"
              >
                {credential.workspaceKey}
              </Text>
              <Text size="$size60" renderAs="span" color="$gray11">
                {credential.customOrigin ?? 'Recontent.app'}
              </Text>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Stack direction="column" alignItems="center" spacing="$space0">
        <Box>
          <MinimalButton
            size="small"
            icon="edit"
            variation="primary"
            onAction={onUpdate}
          >
            Update credentials
          </MinimalButton>
        </Box>

        <Box>
          <MinimalButton
            size="small"
            icon="close"
            variation="danger"
            onAction={() => emit({ type: 'user-config-reset-requested' })}
          >
            Reset credentials
          </MinimalButton>
        </Box>
      </Stack>
    </Stack>
  )
}
