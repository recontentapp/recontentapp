import { violetA } from '@radix-ui/colors'
import { FC } from 'react'

import { styled } from '../../theme'
import { Icon } from './Icon'

const Container = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  gap: '$space20',
  fontWeight: 500,
  lineHeight: 1,
  fontSize: '$size80',
  borderRadius: '$radius200',
  variants: {
    size: {
      small: {
        fontSize: '$size60',
        paddingX: '$space40',
        height: 22,
      },
      medium: {
        fontSize: '$size80',
        paddingX: '$space80',
        height: 30,
      },
    },
    variation: {
      primary: {
        backgroundColor: violetA.violetA5,
        color: violetA.violetA12,
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

const CloseButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  height: 22,
  padding: 0,
  margin: 0,
})

interface TagProps {
  size?: 'small' | 'medium'
  label: string
  color: string
  onClose?: () => void
}

export const Tag: FC<TagProps> = ({
  size = 'medium',
  label,
  color,
  onClose,
}) => {
  return (
    <Container size={size} css={{ backgroundColor: color }}>
      {label}

      {onClose && (
        <CloseButton onClick={onClose}>
          <Icon src="close" size={14} color="$gray14" />
        </CloseButton>
      )}
    </Container>
  )
}
