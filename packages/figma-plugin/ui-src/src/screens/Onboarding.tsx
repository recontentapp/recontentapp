import { Bold, Button, Link, Stack, Text, Textbox } from 'figma-ui-kit'
import React, { FormEvent, useRef, useState } from 'react'
import { getAPIBaseEndpoint, getAppURL } from '../config'
import { useContext } from '../context'
import { request } from '../request'
import { styled } from '../theme'

const Container = styled('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '$large',
  alignItems: 'center',
  paddingX: '$large',
  paddingTop: '$large',
})

export const Onboarding = () => {
  const { emit } = useContext()
  const [apiKey, setAPIkey] = useState('')
  const fetch = useRef(
    request({
      baseUrl: getAPIBaseEndpoint(),
    }),
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    fetch
      .current({
        method: 'get',
        path: '/ping',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .then(res => {
        if (!res.ok) {
          throw new Error()
        }

        emit({ type: 'apiTokenUpdateRequested', data: apiKey })
      })
      .catch(() => {
        setAPIkey('')
        emit({
          type: 'notificationRequested',
          data: {
            message: 'This Figma personal token does not seem valid',
          },
        })
      })
  }

  return (
    <Container>
      <Bold>
        Recontent helps product teams collaborate on content for web & mobile
        apps.
      </Bold>

      <Stack width="100%" direction="column" spacing="$extraLarge">
        <Stack width="100%" direction="column" spacing="$small">
          <div style={{ width: '100%' }}>
            <Textbox
              variant="border"
              placeholder="Your Figma personal token"
              value={apiKey}
              onChange={e => setAPIkey(e.currentTarget.value)}
            />
          </div>

          <Text>
            Get your Figma personal token in your{' '}
            <Link href={getAppURL()} target="_blank">
              Recontent.app
            </Link>{' '}
            user settings.
          </Text>
        </Stack>

        <Button disabled={apiKey.length === 0} onClick={onSubmit}>
          Get started with Recontent.app
        </Button>
      </Stack>
    </Container>
  )
}
