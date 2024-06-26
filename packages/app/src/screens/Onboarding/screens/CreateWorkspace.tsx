import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import slugify from 'slugify'

import {
  Banner,
  Box,
  Button,
  Form,
  Heading,
  Stack,
  Text,
  TextField,
  toast,
} from 'design-system'
import { useAuth } from '../../../auth'
import { useAPIClient, useCreateWorkspace } from '../../../generated/reactQuery'
import { useSystem } from '../../../hooks/system'
import { useUpdate } from '../../../hooks/update'
import routes from '../../../routing'
import { styled } from '../../../theme'
import { useDebounce } from '../../../utils/debounce'

interface State {
  name: string
  key: string
}

const StyledLink = styled('span', {
  '& a': {
    fontWeight: 500,
    color: '$blue800',
  },
})

export const CreateWorkspace = () => {
  const { refetchUser } = useAuth()
  const {
    settings: { workspaceInviteOnly },
  } = useSystem()
  const navigate = useNavigate()
  const apiClient = useAPIClient()
  const params = useParams<'workspaceKey'>()
  const { mutateAsync: createWorkspace, isPending: isCreatingWorkspace } =
    useCreateWorkspace()
  const [state, setState] = useState<State>({
    key: '',
    name: '',
  })
  const [workspaceKeyAvailable, setWorkspaceKeyAvailable] = useState(true)

  const checkAvailability = useCallback(
    (id: string) => {
      apiClient
        .getWorkspaceAvailability({ queryParams: { key: id } })
        .then(res => {
          if (!res.ok) {
            setWorkspaceKeyAvailable(false)
            return
          }

          setWorkspaceKeyAvailable(res.data.isAvailable)
        })
        .catch(() => setWorkspaceKeyAvailable(false))
    },
    [apiClient],
  )

  const debouncedCheckAvailability = useDebounce(checkAvailability, 400)

  useUpdate(() => {
    debouncedCheckAvailability(state.key)
  }, [state.key, debouncedCheckAvailability])

  const onSubmit = () => {
    createWorkspace({
      body: {
        key: state.key,
        name: state.name,
      },
    })
      .then(() => {
        refetchUser()
        setState({
          key: '',
          name: '',
        })
        toast('success', {
          title: 'Workspace created 🚀',
          description:
            'You can access it from the dropdown in the top left corner',
        })

        if (params.workspaceKey) {
          navigate(
            routes.dashboard.url({
              pathParams: { workspaceKey: params.workspaceKey },
            }),
          )
        }
      })
      .catch(() => {
        toast('error', {
          title: 'Could not create workspace',
        })
      })
  }

  const canBeSubmitted =
    state.name.length > 0 &&
    state.name.length <= 40 &&
    new RegExp('[a-z0-9]*').test(state.key) &&
    workspaceKeyAvailable &&
    !workspaceInviteOnly

  return (
    <Box paddingX="$space200" paddingY="$space600">
      <Box width="100%" maxWidth={500} margin="0 auto">
        <Stack width="100%" direction="column" spacing="$space300">
          <Stack direction="column" alignItems="center" spacing="$space60">
            {!params.workspaceKey && (
              <Text size="$size80" color="$gray14">
                Step 2 of 2
              </Text>
            )}

            <Stack direction="column" spacing="$space100">
              <Heading
                textAlign="center"
                renderAs="h1"
                size="$size400"
                lineHeight="$lineHeight100"
                maxWidth={400}
              >
                What's the name of your company or team?
              </Heading>
              <Text
                textAlign="center"
                size="$size100"
                color="$gray11"
                maxWidth={400}
                lineHeight="$lineHeight300"
              >
                This will be the name of your Recontent workspace for you & your
                teammates.
              </Text>
            </Stack>
          </Stack>

          <Form width="100%" onSubmit={onSubmit}>
            <Stack direction="column" spacing="$space300">
              {workspaceInviteOnly && (
                <Banner
                  variation="info"
                  title="Invite-only mode"
                  description="Only existing users with workspaces can create new ones. If you have an invitation, you can join a workspace instead."
                />
              )}

              {!workspaceInviteOnly && (
                <Stack width="100%" direction="column" spacing="$space200">
                  <TextField
                    width="100%"
                    label="Workspace name"
                    autoFocus
                    info={
                      state.name.length > 0
                        ? `Workspace URL: https://recontent.app/${state.key}`
                        : undefined
                    }
                    value={state.name}
                    error={
                      !workspaceKeyAvailable
                        ? `https://recontent.app/${state.key} is already used`
                        : state.name.length > 40
                          ? 'Workspace name must not exceed 40 characters'
                          : undefined
                    }
                    onChange={name => {
                      const key = slugify(name, {
                        replacement: '',
                        remove: undefined,
                        lower: true,
                        strict: true,
                        locale: 'vi',
                        trim: true,
                      })

                      setState(state => ({
                        ...state,
                        name,
                        key,
                      }))
                    }}
                  />
                </Stack>
              )}

              <Stack direction="column" spacing="$space80">
                {!workspaceInviteOnly && (
                  <Box>
                    <Button
                      type="submit"
                      variation="primary"
                      isLoading={isCreatingWorkspace}
                      isDisabled={!canBeSubmitted}
                    >
                      Create workspace
                    </Button>
                  </Box>
                )}

                <Stack direction="row">
                  <Text size="$size100" color="$gray11">
                    Got an invitation by email?{' '}
                    <StyledLink>
                      <Link
                        to={
                          params.workspaceKey
                            ? routes.joinAnotherWorkspace.url({
                                pathParams: {
                                  workspaceKey: params.workspaceKey,
                                },
                              })
                            : routes.onboardingJoinWorkspace.url({})
                        }
                      >
                        Join a workspace instead.
                      </Link>
                    </StyledLink>
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Form>
        </Stack>
      </Box>
    </Box>
  )
}
