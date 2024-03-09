import { FC } from 'react'

import { styled } from '../../theme'
import { Icon, IconName } from './Icon'
import { Tooltip } from './Tooltip'

interface IconButtonProps {
  src: IconName
  onAction: () => void
  isActive?: boolean
  tooltip?: string
  type?: 'button' | 'submit'
}

const Container = styled('button', {
  display: 'inline-flex',
  width: 33,
  height: 28,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  outline: 'none',
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
  variants: {
    isActive: {
      true: {
        color: '$blue900',
      },
    },
  },
})

export const IconButton: FC<IconButtonProps> = ({
  src,
  type,
  isActive,
  onAction,
  tooltip,
}) => {
  return (
    <Tooltip
      title={tooltip ?? ''}
      position="bottom"
      isDisabled={tooltip === undefined}
    >
      <Container onClick={onAction} isActive={isActive} type={type}>
        <Icon src={src} size={20} color={isActive ? '$blue900' : '$gray11'} />
      </Container>
    </Tooltip>
  )
}
