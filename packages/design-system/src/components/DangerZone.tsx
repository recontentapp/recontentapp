import { FC } from 'react'

import { Box, Button, Heading, Stack, Text } from '.'
import { styled } from '../stitches'

interface DangerZoneProps {
  description: string
  cta: string
  isLoading?: boolean
  onAction: () => void
}

const Container = styled('div', {
  border: '1px solid $red100',
  borderRadius: '$radius200',
  padding: '$space100',
})

export const DangerZone: FC<DangerZoneProps> = ({
  description,
  cta,
  isLoading,
  onAction,
}) => {
  return (
    <Container>
      <Stack direction="column" spacing="$space200">
        <Stack direction="column" spacing="$space40">
          <Heading renderAs="h2" size="$size200">
            Danger zone
          </Heading>
          <Text size="$size100" color="$gray11" lineHeight="$lineHeight200">
            {description}
          </Text>
        </Stack>

        <Box>
          <Button variation="danger" onAction={onAction} isLoading={isLoading}>
            {cta}
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}
