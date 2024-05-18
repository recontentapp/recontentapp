import { FC } from 'react'

import { Heading, Icon, Stack, Text } from 'design-system'
import { styled } from '../../../../../theme'

interface StepCardProps {
  title: string
  description: string
  checked?: boolean
  disabled?: boolean
  onAction: () => void
}

const Container = styled('button', {
  minWidth: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  outline: 'none',
  border: '1px dashed $gray7',
  boxShadow: '$shadow100',
  padding: '$space100',
  borderRadius: '$radius200',
  transition: 'all 0.2s ease-in-out',
  paddingY: '$space400',
  '&:disabled': {
    backgroundColor: '$gray2',
    border: '1px solid $gray3',
    boxShadow: 'none',
  },
  '&:not(:disabled)': {
    cursor: 'pointer',
    '&:hover, &:focus': {
      borderColor: '$blue900',
    },
  },
})

export const StepCard: FC<StepCardProps> = ({
  title,
  description,
  onAction,
  disabled = false,
  checked = false,
}) => {
  return (
    <Container onClick={onAction} disabled={checked || disabled}>
      <Stack direction="column" spacing="$space100" alignItems="center">
        <Icon
          src={checked ? 'check_circle' : 'add_circle'}
          size={24}
          color={checked ? '$green100' : disabled ? '$gray10' : '$blue900'}
        />

        <Stack direction="column" spacing="$space40" alignItems="center">
          <Heading
            renderAs="span"
            size="$size100"
            textWrap="balance"
            maxWidth={160}
          >
            {title}
          </Heading>

          <Text
            size="$size60"
            lineHeight="$lineHeight200"
            color="$gray11"
            textWrap="balance"
            maxWidth={200}
          >
            {description}
          </Text>
        </Stack>
      </Stack>
    </Container>
  )
}
