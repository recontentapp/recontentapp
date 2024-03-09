import { FC } from 'react'

import { styled } from '../../theme'

const Container = styled('span', {
  borderRadius: '$radius500',
  color: '$white',
  variants: {
    size: {
      sm: {
        fontSize: '$size60',
        paddingX: '$space60',
        paddingY: '$space40',
      },
      md: {
        fontSize: '$size80',
        paddingX: '$space80',
        paddingY: '$space60',
      },
    },
    variation: {
      success: {
        backgroundColor: '$green100',
      },
      danger: {
        backgroundColor: '$red100',
      },
      primary: {
        backgroundColor: '$purple800',
      },
    },
  },
})

interface StatusBadgeProps {
  variation: 'success' | 'danger' | 'primary'
  label: string
  size: 'sm' | 'md'
}

export const StatusBadge: FC<StatusBadgeProps> = ({
  variation,
  size,
  label,
}) => {
  return (
    <Container title={`Status: ${label}`} size={size} variation={variation}>
      {label}
    </Container>
  )
}
