import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Box,
  Button,
  Form,
  Heading,
  Stack,
  Text,
  TextField,
  toast,
} from '../../../components/primitives'
import { useAuth, useCurrentUser } from '../../../auth'
import { useUpdateCurrentUser } from '../../../generated/reactQuery'
import routes from '../../../routing'
import { useSystem } from '../../../hooks/system'

export const You: FC = () => {
  const {
    settings: { workspaceInviteOnly },
  } = useSystem()
  const { refetchUser } = useAuth()
  const { firstName, lastName } = useCurrentUser()
  const { mutateAsync, isPending } = useUpdateCurrentUser()
  const [state, setState] = useState({
    firstName: '',
    lastName: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (firstName.length > 0 && lastName.length > 0) {
      if (workspaceInviteOnly) {
        navigate(routes.onboardingJoinWorkspace.url({}))
      } else {
        navigate(routes.onboardingCreateWorkspace.url({}))
      }
    }
  }, [firstName, lastName, navigate, workspaceInviteOnly])

  const onSubmit = () => {
    if (isPending) {
      return
    }

    mutateAsync({ body: state })
      .then(refetchUser)
      .then(() => {
        if (workspaceInviteOnly) {
          navigate(routes.onboardingJoinWorkspace.url({}))
        } else {
          navigate(routes.onboardingCreateWorkspace.url({}))
        }
      })
      .catch(() => {
        toast('error', {
          title: 'Could not update your name',
          description: 'Please try later',
        })
      })
  }

  const canBeSubmitted = state.firstName.length > 0 && state.lastName.length > 0

  return (
    <Box paddingX="$space200" paddingY="$space600">
      <Box width="100%" maxWidth={400} margin="0 auto">
        <Stack width="100%" direction="column" spacing="$space300">
          <Stack direction="column" alignItems="center" spacing="$space60">
            <Text size="$size80" color="$gray14">
              Step 1 of 2
            </Text>

            <Stack direction="column" spacing="$space100">
              <Heading
                textAlign="center"
                renderAs="h1"
                size="$size400"
                lineHeight="$lineHeight100"
                maxWidth={400}
              >
                Welcome to Recontent
              </Heading>
              <Text
                textAlign="center"
                size="$size100"
                color="$gray11"
                maxWidth={400}
                lineHeight="$lineHeight300"
              >
                First things first, tell us a bit about yourself.
              </Text>
            </Stack>
          </Stack>

          <Form width="100%" onSubmit={onSubmit}>
            <Stack direction="column" spacing="$space300">
              <Stack width="100%" direction="column" spacing="$space200">
                <TextField
                  width="100%"
                  label="What is your first name?"
                  placeholder="e.g. John"
                  value={state.firstName}
                  onChange={name =>
                    setState(state => ({ ...state, firstName: name }))
                  }
                />

                <TextField
                  width="100%"
                  label="What is your last name?"
                  placeholder="e.g. Doe"
                  value={state.lastName}
                  onChange={name =>
                    setState(state => ({ ...state, lastName: name }))
                  }
                />
              </Stack>

              <Stack direction="column" spacing="$space80">
                <Box>
                  <Button
                    type="submit"
                    variation="primary"
                    isLoading={isPending}
                    isDisabled={!canBeSubmitted}
                  >
                    Continue
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </Form>
        </Stack>
      </Box>
    </Box>
  )
}
