import { Button, Link, Text, Stack, Section } from 'figma-ui-kit'
import React from 'react'
import { useDeleteFigmaDocument } from '../api'
import { APIKeyForm } from '../components/APIKeyForm'
import { getAppURL } from '../config'
import { useContext } from '../context'

export const Settings = () => {
  const { emit, id, updateScreen } = useContext()
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
    <div>
      <Section title="Figma personal token">
        <Stack direction="column" spacing="$small">
          <Text>
            You can get your Figma personal token by going to your{' '}
            <Link href={getAppURL()} target="_blank">
              Recontent.app
            </Link>{' '}
            user settings.
          </Text>

          <APIKeyForm />
        </Stack>
      </Section>

      <Section title="This file">
        <div>
          <Button onClick={reset} secondary danger loading={isDeleting}>
            Disconnect from Recontent.app
          </Button>
        </div>
      </Section>
    </div>
  )
}
