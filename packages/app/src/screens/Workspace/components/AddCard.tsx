import { FC } from 'react'

import { Heading, Icon, Stack, Text } from 'design-system'
import { styled } from '../../../theme'

interface AddCardProps {
  title: string
  description: string
  onAction: () => void
}

const Container = styled('button', {
  height: 194,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  outline: 'none',
  cursor: 'pointer',
  border: '1px dashed $gray7',
  boxShadow: '$shadow100',
  padding: '$space100',
  borderRadius: '$radius200',
  transition: 'all 0.2s ease-in-out',
  paddingY: '$space400',
  '&:hover, &:focus': {
    borderColor: '$blue900',
  },
})

export const AddCard: FC<AddCardProps> = ({ title, description, onAction }) => {
  return (
    <Container onClick={onAction}>
      <Stack direction="column" spacing="$space100" alignItems="center">
        <Icon src="add_circle" size={24} color="$blue900" />
        <Stack direction="column" spacing="$space40" alignItems="center">
          <Heading renderAs="span" size="$size100">
            {title}
          </Heading>
          <Text
            size="$size60"
            lineHeight="$lineHeight200"
            color="$gray11"
            maxWidth={200}
          >
            {description}
          </Text>
        </Stack>
      </Stack>
    </Container>
  )
}
