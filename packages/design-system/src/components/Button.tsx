import { FC, ReactNode } from 'react'

import { styled } from '../theme'
import { Box } from './Box'
import { Icon, IconName } from './Icon'
import { Spinner } from './Spinner'
import { Stack } from './Stack'

export type ButtonVariation = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'medium' | 'small' | 'xsmall'

interface ButtonProps {
  children?: ReactNode
  type?: 'submit' | 'button'
  variation: ButtonVariation
  size?: ButtonSize
  onAction?: () => void
  iconPosition?: 'left' | 'right'
  isFullwidth?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  icon?: IconName
}

const Container = styled('button', {
  position: 'relative',
  cursor: 'pointer',
  outline: 'none',
  borderRadius: '$radius100',
  fontWeight: 500,
  transition: 'background-color 0.2s ease-in-out',
  '&:disabled': {
    cursor: 'not-allowed',
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
    variation: {
      primary: {
        border: '1px solid $indigo80',
        borderRadius: '$radius200',
        backgroundColor: '$blue900',
        boxShadow:
          'rgb(15 15 15 / 10%) 0px 0px 0px 1px inset, rgb(15 15 15 / 10%) 0px 1px 2px',
        color: '$gray1',
        '&:hover,&:focus': {
          backgroundColor: '$blue800',
        },
        '&:active': {
          backgroundColor: '$blue700',
        },
      },
      secondary: {
        backgroundColor: '$gray1',
        borderRadius: '$radius200',
        boxShadow: '$shadow200',
        border: '1px solid $gray6',
        color: '$gray14',
        '&:hover,&:focus': {
          backgroundColor: '$gray2',
        },
        '&:active': {
          backgroundColor: '$gray3',
        },
      },
      danger: {
        backgroundColor: '$red100',
        borderRadius: '$radius200',
        boxShadow: '$shadow200',
        border: '1px solid red',
        color: '$gray1',
        '&:hover,&:focus': {
          backgroundColor: '$red200',
        },
        '&:active': {
          backgroundColor: '$red200',
        },
      },
    },
    isFullwidth: {
      true: {
        display: 'block',
        textAlign: 'center',
        width: '100%',
      },
    },
    isDisabled: {
      true: {
        cursor: 'not-allowed',
        color: '$gray10 !important',
        boxShadow: 'none !important',
        border: '1px solid $gray5 !important',
        outline: 'none !important',
        backgroundColor: '$gray5 !important',
      },
    },
    isLoading: {
      true: {
        cursor: 'progress',
        '.content': {
          opacity: 0,
        },
      },
    },
  },
  '.loading-container': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
})

export const Button: FC<ButtonProps> = ({
  variation,
  size = 'medium',
  icon,
  iconPosition = 'left',
  type = 'button',
  isDisabled,
  isFullwidth,
  isLoading,
  onAction,
  children,
}) => {
  return (
    <Container
      type={type}
      size={size}
      variation={variation}
      isDisabled={isDisabled}
      disabled={isDisabled}
      isFullwidth={isFullwidth}
      isLoading={isLoading}
      onClick={() => {
        if (isLoading || isDisabled || !onAction) {
          return
        }

        onAction()
      }}
    >
      {isLoading && (
        <Box className="loading-container">
          <Spinner
            color={variation === 'secondary' ? '$gray11' : '$gray1'}
            size={16}
          />
        </Box>
      )}
      <Stack
        className="content"
        direction="row"
        alignItems="center"
        justifyContent={isFullwidth ? 'center' : 'space-between'}
      >
        <Stack
          direction={iconPosition === 'right' ? 'row-reverse' : 'row'}
          alignItems="center"
          spacing="$space40"
        >
          {icon && (
            <Icon
              src={icon}
              size={16}
              color={
                isDisabled
                  ? '$gray9'
                  : variation === 'primary'
                    ? '$gray1'
                    : variation === 'danger'
                      ? '$white'
                      : '$gray14'
              }
            />
          )}
          {children}
        </Stack>
      </Stack>
    </Container>
  )
}
