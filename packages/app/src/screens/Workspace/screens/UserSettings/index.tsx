import { FC, useState } from 'react'

import { Head } from '../../../../components/Head'
import {
  Box,
  Button,
  Form,
  Heading,
  Stack,
  TextField,
  toast,
} from '../../../../components/primitives'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { useCurrentUser } from '../../../../auth'
import { useUpdateCurrentUser } from '../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'

export const UserSettings: FC = () => {
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const { firstName: initialFirstName, lastName: initialLastName } =
    useCurrentUser()
  const [state, setState] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
  })
  const { mutateAsync, isPending } = useUpdateCurrentUser()

  const onSubmitName = () => {
    if (
      isPending ||
      state.firstName.length === 0 ||
      state.lastName.length === 0
    ) {
      return
    }

    mutateAsync({ body: state })
      .then(() => {
        toast('success', {
          title: 'Name saved',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not save name',
        })
      })
  }

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: 'User settings',
          path: routes.userSettings.url({ pathParams: { workspaceKey } }),
        },
      ]}
    >
      <Head title="User settings" />
      <Page title="User settings">
        <Stack direction="column" spacing="$space400">
          <Stack direction="column" spacing="$space100">
            <Heading renderAs="h2" size="$size200">
              Global
            </Heading>

            <Stack direction="column" spacing="$space200">
              <Form onSubmit={onSubmitName}>
                <Stack
                  direction="row"
                  spacing="$space100"
                  alignItems="flex-end"
                >
                  <TextField
                    label="First name"
                    onChange={name => setState({ ...state, firstName: name })}
                    value={state.firstName}
                  />

                  <TextField
                    label="Last name"
                    onChange={name => setState({ ...state, lastName: name })}
                    value={state.lastName}
                  />

                  <Box display="block">
                    <Button
                      type="submit"
                      variation="secondary"
                      isDisabled={
                        state.firstName.length === 0 ||
                        state.lastName.length === 0
                      }
                      isLoading={isPending}
                    >
                      Save changes
                    </Button>
                  </Box>
                </Stack>
              </Form>
            </Stack>
          </Stack>
        </Stack>
      </Page>
    </ScreenWrapper>
  )
}
