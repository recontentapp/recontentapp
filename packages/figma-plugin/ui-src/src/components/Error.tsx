import { Bold, Button, Link, Stack, Text } from 'figma-ui-kit'
import React from 'react'
import { useDeleteFigmaDocument } from '../api'
import { getAppURL } from '../config'
import { useContext } from '../context'
import { styled } from '../theme'

const Container = styled('div', {
  width: '100%',
  height: 'calc(100% - 41px)',
  display: 'flex',
  flexDirection: 'column',
})

export const Error = () => {
  const { updateScreen, id, emit } = useContext()
  const { mutateAsync: deleteFigmaDocument, isLoading: isDeleting } =
    useDeleteFigmaDocument()

  const reset = () => {
    deleteFigmaDocument(id!)
      .then(() => {
        emit({ type: 'resetRequested' })
        updateScreen('Inspect')
      })
      .catch(() => {
        emit({
          type: 'notificationRequested',
          data: { message: 'Could not reset file', error: true },
        })
      })
  }

  return (
    <Container>
      <Stack
        direction="column"
        spacing="$extraLarge"
        paddingX="$medium"
        paddingY="$medium"
      >
        <Stack direction="column" spacing="$medium">
          <Bold>
            Looks like your Figma document is linked to Recontent.app but
            there's an issue with it.
          </Bold>

          <Text>
            The project to which it is associated on Recontent.app might have
            been deleted or there's an issue with{' '}
            <Link href={getAppURL()} target="_blank">
              Recontent.app
            </Link>
            .
          </Text>
        </Stack>

        <Stack direction="column" spacing="$medium">
          <Text>Try again later or choose to reset your file.</Text>
          <Button onClick={reset} secondary danger loading={isDeleting}>
            Disconnect from Recontent.app
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}
