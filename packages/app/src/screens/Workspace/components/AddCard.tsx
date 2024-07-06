import { FC } from 'react'

import { Heading, Icon, IconName, Stack, Text } from 'design-system'
import { styled } from '../../../theme'

interface AddCardProps {
  title: string
  description?: string
  icon?: IconName
  onAction: () => void
}

const Container = styled('button', {
  height: 194,
  minWidth: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
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

export const AddCard: FC<AddCardProps> = ({
  title,
  description,
  icon = 'add_circle',
  onAction,
}) => {
  return (
    <Container onClick={onAction}>
      <Stack direction="column" spacing="$space100" alignItems="center">
        <Icon src={icon} size={24} color="$blue900" />
        <Stack direction="column" spacing="$space40" alignItems="center">
          <Heading renderAs="span" size="$size100">
            {title}
          </Heading>
          {description && (
            <Text
              size="$size60"
              lineHeight="$lineHeight200"
              color="$gray11"
              maxWidth={200}
            >
              {description}
            </Text>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}
