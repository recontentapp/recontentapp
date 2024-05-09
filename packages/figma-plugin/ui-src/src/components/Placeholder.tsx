import React from 'react'
import { Box, Muted } from 'figma-ui-kit'

export const Placeholder = () => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box maxWidth={200}>
        <Muted style={{ textAlign: 'center' }}>
          Select one or multiple layers to start using Recontent.app
        </Muted>
      </Box>
    </Box>
  )
}
