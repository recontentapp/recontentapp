import { FC } from 'react'

import { styled } from '../theme'
import { Icon } from './Icon'
import { getColorBasedOnBackground } from '../utils/colors'

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
  const textColor = getColorBasedOnBackground(color)

  return (
    <Container size={size} css={{ backgroundColor: color }}>
      <span style={{ color: textColor }}>{label}</span>

      {onClose && (
        <CloseButton onClick={onClose}>
          <Icon src="close" size={14} color="$gray14" />
        </CloseButton>
      )}
    </Container>
  )
}
