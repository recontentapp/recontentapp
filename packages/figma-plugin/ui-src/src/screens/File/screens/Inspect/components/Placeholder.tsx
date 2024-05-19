import { Stack, Text } from 'design-system'

export const Placeholder = () => {
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
