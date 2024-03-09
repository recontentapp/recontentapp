import { FC } from 'react'

import { ColorValue, styled } from '../../theme'
import { Icon, IconName } from './Icon'
import { Stack } from './Stack'
import { Text } from './Text'

type MinimalButtonVariation = 'minimal' | 'primary' | 'danger'

interface MinimalButtonProps {
  onAction: () => void
  variation?: MinimalButtonVariation
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
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack
          direction={iconPosition === 'right' ? 'row-reverse' : 'row'}
          alignItems="center"
          spacing="$space40"
        >
          {icon && <Icon src={icon} size={16} color={color} />}
          <Text size="$size80" variation="semiBold" color={color}>
            {children}
          </Text>
        </Stack>
      </Stack>
    </Container>
  )
}
