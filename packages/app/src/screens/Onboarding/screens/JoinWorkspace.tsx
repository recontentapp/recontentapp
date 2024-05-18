import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Box,
  Button,
  Form,
  Heading,
  Stack,
  Text,
  TextField,
  toast,
} from 'design-system'
import { useJoinWorkspace } from '../../../generated/reactQuery'
import { useLooseCurrentWorkspace } from '../../../hooks/workspace'
import routes from '../../../routing'
import { useAuth } from '../../../auth'

export const JoinWorkspace = () => {
  const { refetchUser } = useAuth()
  const { currentWorkspace } = useLooseCurrentWorkspace()
  const params = useParams<'workspaceKey'>()
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useJoinWorkspace()
  const [invitationCode, setInvitationCode] = useState('')

  const onSubmit = () => {
    if (isPending) {
      return
    }

    mutateAsync({ body: { invitationCode } })
      .then(() => {
        refetchUser()
        toast('success', {
          title: 'Workspace joined 🚀',
          description: 'You can now create projects & start adding content',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not join workspace',
        })
      })
  }

  useEffect(() => {
    if (
      params.workspaceKey &&
      currentWorkspace &&
      params.workspaceKey !== currentWorkspace.key
    ) {
      navigate(
        routes.dashboard.url({
          pathParams: { workspaceKey: currentWorkspace.key },
        }),
      )
    }
  }, [params.workspaceKey, currentWorkspace?.key])

  const canBeSubmitted = invitationCode.length > 0

  return (
    <Box paddingX="$space200" paddingY="$space600">
      <Box width="100%" maxWidth={500} margin="0 auto">
        <Stack width="100%" direction="column" spacing="$space300">
          <Stack direction="column" alignItems="center" spacing="$space60">
            <Text size="$size80" color="$gray14">
              Step 2 of 2
            </Text>

            <Stack direction="column" spacing="$space100">
              <Heading
                textAlign="center"
                renderAs="h1"
                size="$size400"
                lineHeight="$lineHeight100"
                maxWidth={400}
              >
                Join an existing workspace
              </Heading>
              <Text
                textAlign="center"
                size="$size100"
                color="$gray11"
                maxWidth={400}
                lineHeight="$lineHeight300"
              >
                You should have received a code by email to join your teammates
                on Recontent.
              </Text>
            </Stack>
          </Stack>

          <Form onSubmit={onSubmit}>
            <Stack direction="column" spacing="$space200">
              <TextField
                label="Your code"
                info=""
                value={invitationCode}
                onChange={invitationCode => setInvitationCode(invitationCode)}
              />

              <Box>
                <Button
                  type="submit"
                  variation="primary"
                  isLoading={isPending}
                  isDisabled={!canBeSubmitted}
                >
                  Join workspace
                </Button>
              </Box>
            </Stack>
          </Form>
        </Stack>
      </Box>
    </Box>
  )
}
