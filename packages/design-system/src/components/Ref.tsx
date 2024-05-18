import { FC } from 'react'

import { styled } from '../theme'

interface RefProps {
  label: string
}

const Container = styled('span', {
  backgroundColor: '$purple100',
  borderRadius: '$radius200',
  color: '$purple800',
  fontSize: '$size80',
  fontWeight: 500,
  paddingY: '$space20',
  paddingX: '$space40',
})

export const Ref: FC<RefProps> = ({ label }) => {
  return <Container>{label}</Container>
}
