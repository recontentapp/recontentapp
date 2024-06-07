import { GoogleIcon, Spinner, Stack, Text } from 'design-system'
import { FC } from 'react'
import { styled } from '../../../theme'

const GoogleButtonContainer = styled('button', {
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  minHeight: 35,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  outline: 'none',
  fontWeight: 500,
  transition: 'background-color 0.2s ease-in-out',
  paddingX: '$space80',
  paddingY: '$space60',
  fontSize: '$size80',
  border: '1px solid $indigo80',
  borderRadius: '$radius200',
  backgroundColor: '#white',
  boxShadow:
    'rgb(15 15 15 / 10%) 0px 0px 0px 1px inset, rgb(15 15 15 / 10%) 0px 1px 2px',
  color: '$gray1',
  '&:hover,&:focus': {
    backgroundColor: '$gray2',
  },
  '&:active': {
    backgroundColor: '$gray2',
  },
  '&:disabled': {
    cursor: 'wait',
  },
})

interface GoogleButtonProps {
  onAction: () => void
  isLoading: boolean
}

export const GoogleButton: FC<GoogleButtonProps> = ({
  isLoading,
  onAction,
}) => {
  return (
    <GoogleButtonContainer
      type="button"
      disabled={isLoading}
      onClick={onAction}
    >
      <Stack direction="row" alignItems="center" spacing="$space80">
        {isLoading ? (
          <Spinner color="$gray14" size={16} />
        ) : (
          <>
            <GoogleIcon variation="colorful" size={16} />
            <Text size="$size80" color="$gray14">
              Sign in with Google
            </Text>
          </>
        )}
      </Stack>
    </GoogleButtonContainer>
  )
}
