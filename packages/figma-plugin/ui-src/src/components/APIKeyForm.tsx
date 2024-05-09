import React, { useState } from 'react'
import { Box, Button, Stack, Textbox } from 'figma-ui-kit'
import { useContext } from '../context'
import { request } from '../request'
import { getAPIBaseEndpoint } from '../config'

export const APIKeyForm = () => {
  const { apiKey: configAPIKey, emit, updateScreen } = useContext()
  const [apiKey, setApiKey] = useState(configAPIKey ?? '')

  const onSaveAPIKey = async () => {
    request({
      baseUrl: getAPIBaseEndpoint(),
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })({
      path: '/ping',
      method: 'get',
    })
      .then(res => {
        if (!res.ok) {
          throw new Error()
        }

        emit({ type: 'apiTokenUpdateRequested', data: apiKey })
        updateScreen('Inspect')
      })
      .catch(() => {
        emit({
          type: 'notificationRequested',
          data: { message: 'API token is invalid', error: true },
        })
      })
  }

  return (
    <Stack direction="row" spacing="$extraSmall" alignItems="center">
      <Box flexGrow={1}>
        <div style={{ width: '100%' }}>
          <Textbox
            variant="border"
            placeholder="API key..."
            value={apiKey}
            onChange={e => setApiKey(e.currentTarget.value)}
          />
        </div>
      </Box>

      <Button disabled={apiKey.length === 0} onClick={onSaveAPIKey}>
        Save
      </Button>
    </Stack>
  )
}
