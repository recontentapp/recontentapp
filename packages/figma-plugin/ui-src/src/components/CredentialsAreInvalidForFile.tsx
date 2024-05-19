import { Box, Button, Text } from 'design-system'

interface CredentialsAreInvalidForFileProps {
  onSelect: () => void
}

export const CredentialsAreInvalidForFile = ({
  onSelect,
}: CredentialsAreInvalidForFileProps) => {
  return (
    <Box>
      <Text size="$size100" color="$gray14">
        Your selected credentials are invalid for current file. Please make sure
        to add some.
      </Text>

      <Button variation="primary" onAction={onSelect}>
        Select credentials
      </Button>
    </Box>
  )
}
