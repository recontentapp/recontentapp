import { FC } from 'react'

import { Spinner, Stack } from 'design-system'
import { Logo } from './Logo'
import { styled } from '../theme'

const Container = styled('div', {
  width: '100%',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

interface FullpageSpinnerProps {
  variation?: 'minimal' | 'primary'
}

export const FullpageSpinner: FC<FullpageSpinnerProps> = ({
  variation = 'minimal',
}) => (
  <Container>
    <Stack direction="column" spacing="$space200" alignItems="center">
      {variation === 'primary' && <Logo variation="colorful" size={180} />}
      <Spinner size={32} color="$gray9" />
    </Stack>
  </Container>
)
