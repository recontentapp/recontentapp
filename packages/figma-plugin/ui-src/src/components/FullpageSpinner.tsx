import { Box, Spinner } from 'design-system'

export const FullpageSpinner = () => {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size={32} color="$purple800" />
    </Box>
  )
}
