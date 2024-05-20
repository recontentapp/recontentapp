import { Stack, Heading, Text, Box, MinimalButton } from 'design-system'
import { useBridge } from '../../../contexts/Bridge'

export const ErrorLoadingFile = () => {
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
          File not found on Recontent.app
        </Heading>

        <Text
          textAlign="center"
          size="$size60"
          lineHeight="$lineHeight200"
          renderAs="span"
          color="$gray11"
        >
          Looks like this linked Figma file is not found on Recontent.app.
          Please try again later or unlink it to start again.
        </Text>
      </Stack>

      <Stack direction="column" alignItems="center" spacing="$space0">
        <Box>
          <MinimalButton
            size="small"
            icon="unlink"
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
