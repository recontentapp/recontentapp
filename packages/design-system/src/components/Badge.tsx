import { FC, ReactNode } from 'react'

import { styled } from '../stitches'

const Container = styled('span', {
  display: 'inline-block',
  fontWeight: 500,
  lineHeight: 1,
  fontSize: '$size80',
  borderRadius: '$radius200',
  paddingX: '$space80',
  paddingY: '$space60',
  variants: {
    size: {
      xsmall: {
        fontSize: '$size40',
        padding: '$space40',
      },
      small: {
        fontSize: '$size60',
        padding: '$space40',
      },
      medium: {
        fontSize: '$size80',
        paddingX: '$space80',
        paddingY: '$space60',
      },
    },
    variation: {
      primary: {
        backgroundColor: '$purple100',
        color: '$purple800',
      },
      neutral: {
        backgroundColor: '$gray4',
        color: '$gray14',
      },
      success: {
        backgroundColor: '$green200',
        color: '$white',
      },
      danger: {
        backgroundColor: '$red200',
        color: '$white',
      },
    },
  },
})

interface BadgeProps {
  size?: 'xsmall' | 'small' | 'medium'
  variation: 'primary' | 'success' | 'danger' | 'neutral'
  children: ReactNode
}

export const Badge: FC<BadgeProps> = ({
  size = 'medium',
  variation,
  children,
}) => {
  return (
    <Container size={size} variation={variation}>
      {children}
    </Container>
  )
}
