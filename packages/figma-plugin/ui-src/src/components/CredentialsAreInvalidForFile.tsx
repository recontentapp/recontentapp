import { Stack, Text, Heading, MinimalButton, Box } from 'design-system'
import { useBridge } from '../contexts/Bridge'

interface CredentialsAreInvalidForFileProps {
  onSelect: () => void
}

export const CredentialsAreInvalidForFile = ({
  onSelect,
}: CredentialsAreInvalidForFileProps) => {
  const { emit } = useBridge()

  return (
    <Stack
      width="100%"
      direction="column"
      spacing="$space100"
      paddingX="$space80"
      paddingY="$space80"
      alignItems="center"
      justifyContent="center"
    >
      <Stack
        direction="column"
        spacing="$space60"
        alignItems="center"
        justifyContent="center"
      >
        <Heading
          textAlign="center"
          renderAs="h1"
          color="$gray14"
          size="$size100"
        >
          Invalid credentials
        </Heading>

        <Text
          textAlign="center"
          size="$size60"
          lineHeight="$lineHeight200"
          renderAs="span"
          color="$gray11"
        >
          This Figma file is already configured with Recontent.app using a
          different workspace and/or self-hosted version.
        </Text>
      </Stack>

      <Stack direction="column" alignItems="center" spacing="$space0">
        <Box>
          <MinimalButton
            size="small"
            icon="chevron_right"
            variation="primary"
            onAction={onSelect}
          >
            Choose other credentials
          </MinimalButton>
        </Box>

        <Box>
          <MinimalButton
            size="small"
            icon="close"
            variation="danger"
            onAction={() => emit({ type: 'file-config-reset-requested' })}
          >
            Unlink Figma file from Recontent.app
          </MinimalButton>
        </Box>
      </Stack>
    </Stack>
  )
}
