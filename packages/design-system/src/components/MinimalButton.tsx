import { FC } from 'react'

import { styled } from '../stitches'
import { ColorValue } from '../theme'
import { ButtonSize } from './Button'
import { Icon, IconName } from './Icon'
import { Stack } from './Stack'

type MinimalButtonVariation = 'minimal' | 'primary' | 'danger'

interface MinimalButtonProps {
  onAction: () => void
  variation?: MinimalButtonVariation
  size?: ButtonSize
  iconPosition?: 'left' | 'right'
  isActive?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  children?: string
  icon?: IconName
}

const Container = styled('button', {
  display: 'inline',
  cursor: 'pointer',
  outline: 'none',
  fontWeight: 500,
  paddingX: '$space80',
  paddingY: '$space60',
  fontSize: '$size80',
  transition: 'background-color 0.2s ease-in-out',
  backgroundColor: 'transparent',
  borderRadius: '$radius200',
  color: '$gray10',
  '&:hover,&:focus': {
    backgroundColor: '$gray3',
  },
  '&:active': {
    backgroundColor: '$gray4',
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
  '&[data-loading="true"]': {
    cursor: 'progress',
  },
  variants: {
    size: {
      medium: {
        fontSize: '$size80',
        paddingX: '$space80',
        paddingY: '$space60',
      },
      small: {
        fontSize: '$size60',
        paddingX: '$space80',
        paddingY: '$space60',
      },
      xsmall: {
        fontSize: '$size60',
        paddingX: '$space60',
        paddingY: '$space40',
      },
    },
    isActive: {
      true: {
        color: '$blue900',
      },
    },
    hasIcon: {
      true: {
        paddingLeft: '$space60',
      },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        color: '$gray10',
        boxShadow: 'none !important',
        border: '1px solid $gray6 !important',
        outline: 'none !important',
        backgroundColor: '$gray6 !important',
      },
    },
  },
})

const iconColorMap: Record<MinimalButtonVariation, ColorValue> = {
  minimal: '$gray10',
  primary: '$blue900',
  danger: '$red100',
}

export const MinimalButton: FC<MinimalButtonProps> = ({
  icon,
  iconPosition = 'left',
  isDisabled = false,
  variation = 'minimal',
  size = 'medium',
  isActive,
  isLoading,
  onAction,
  children,
}) => {
  const color = isDisabled ? '$gray10' : iconColorMap[variation]

  return (
    <Container
      disabled={isDisabled}
      onClick={onAction}
      isActive={isActive}
      hasIcon={icon !== undefined}
      data-loading={isLoading}
      size={size}
      css={{ color }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack
          direction={iconPosition === 'right' ? 'row-reverse' : 'row'}
          alignItems="center"
          spacing="$space40"
        >
          {icon && <Icon src={icon} size={16} color={color} />}

          {children && <span>{children}</span>}
        </Stack>
      </Stack>
    </Container>
  )
}
