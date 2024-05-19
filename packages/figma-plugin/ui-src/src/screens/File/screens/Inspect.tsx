import { Stack, Text } from 'design-system'
import { useBridge } from '../../../contexts/Bridge'

export const Inspect = () => {
  const { selection } = useBridge()

  if (selection.texts.length === 0) {
    return (
      <Stack
        direction="column"
        width="100%"
        paddingY="$space400"
        paddingX="$space400"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          textAlign="center"
          size="$size80"
          lineHeight="$lineHeight200"
          color="$gray9"
          maxWidth={200}
        >
          Select one or multiple texts to start using Recontent.app
        </Text>
      </Stack>
    )
  }

  return (
    <Stack direction="column" spacing="$space200">
      <pre>{JSON.stringify(selection, null, 2)}</pre>
    </Stack>
  )
}
