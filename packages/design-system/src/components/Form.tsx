import { FC, ReactNode } from 'react'

import { styled } from '../stitches'

interface FormProps {
  width?: string
  onSubmit: () => void
  children: ReactNode
}

const Container = styled('form', {})

export const Form: FC<FormProps> = ({ children, width, onSubmit }) => {
  return (
    <Container
      css={{ width }}
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {children}
    </Container>
  )
}
