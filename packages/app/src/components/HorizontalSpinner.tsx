import { Spinner } from 'design-system'
import { styled } from '../theme'

const Container = styled('div', {
  width: '100%',
  paddingY: '$space200',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const HorizontalSpinner = () => (
  <Container>
    <Spinner size={32} color="$gray10" />
  </Container>
)
