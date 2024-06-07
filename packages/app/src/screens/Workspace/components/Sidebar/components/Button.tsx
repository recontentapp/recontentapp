import { Icon, Stack } from 'design-system'
import { styled } from '../../../../../theme'
import { useKBarContext } from '../../KBar'

const Indication = styled('span', {
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  color: '$gray1',
  opacity: 0.6,
})

const Container = styled('button', {
  position: 'relative',
  cursor: 'pointer',
  outline: 'none',
  transition: 'background-color 0.2s ease-in-out',
  fontSize: '$size80',
  paddingX: '$space80',
  paddingTop: 5,
  paddingBottom: 5,
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
  '&:disabled': {
    cursor: 'not-allowed',
  },
  display: 'block',
  textAlign: 'center',
  width: '100%',
})

const ua = navigator.userAgent.toLowerCase()
const isApple = ua.includes('macintosh') || ua.includes('macos')

export const Button = () => {
  const { setIsOpen } = useKBarContext()

  return (
    <Container type="button" onClick={() => setIsOpen(true)}>
      <Stack
        className="content"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems="center" spacing="$space40">
          <Icon src="edit" size={16} color="$gray1" />
          Add
        </Stack>

        <Indication>{isApple ? 'Cmd+k' : 'Ctrl+k'}</Indication>
      </Stack>
    </Container>
  )
}
