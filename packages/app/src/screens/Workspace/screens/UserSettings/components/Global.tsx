import { useState } from 'react'
import { useCurrentUser } from '../../../../../auth'
import { useUpdateCurrentUser } from '../../../../../generated/reactQuery'
import {
  Box,
  Button,
  Form,
  Heading,
  Stack,
  TextField,
  toast,
} from 'design-system'

export const Global = () => {
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
    <Stack direction="column" spacing="$space100">
      <Heading renderAs="h2" size="$size200">
        Global
      </Heading>

      <Stack direction="column" spacing="$space200">
        <Form onSubmit={onSubmitName}>
          <Stack direction="row" spacing="$space100" alignItems="flex-end">
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
                  state.firstName.length === 0 || state.lastName.length === 0
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
  )
}
