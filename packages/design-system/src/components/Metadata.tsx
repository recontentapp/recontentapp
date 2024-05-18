import { FC } from 'react'

import { styled } from '../theme'
import { Box } from './Box'
import { Stack } from './Stack'
import { Text } from './Text'

interface MetadataProps {
  metadata: Array<{
    label: string
    value: string
  }>
}

const Container = styled('div', {
  width: '100%',
  backgroundColor: '$gray3',
  paddingX: '$space100',
  paddingY: '$space80',
  borderRadius: '$radius200',
})

export const Metadata: FC<MetadataProps> = ({ metadata }) => {
  return (
    <Container>
      <Stack renderAs="ul" width="100%" direction="column" spacing="$space0">
        {metadata.map((item, index) => (
          <Stack
            key={index}
            renderAs="li"
            direction="row"
            flexWrap="nowrap"
            alignItems="center"
            spacing="$space80"
          >
            <Box width="30%">
              <Text
                renderAs="span"
                size="$size100"
                color="$gray11"
                lineHeight="$lineHeight200"
              >
                {item.label}
              </Text>
            </Box>
            <Box>
              <Text
                renderAs="span"
                size="$size100"
                color="$gray14"
                variation="bold"
                lineHeight="$lineHeight200"
              >
                {item.value}
              </Text>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Container>
  )
}
