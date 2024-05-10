import { FC, useState } from 'react'

import {
  Box,
  Button,
  Form,
  Stack,
  TextField,
  toast,
} from '../../../../../components/primitives'
import {
  getListWorkspaceAccountsQueryKey,
  useCreateWorkspaceServiceAccount,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { useQueryClient } from '@tanstack/react-query'

interface AddAPIKeyFormProps {
  onClose: () => void
}

export const AddAPIKeyForm: FC<AddAPIKeyFormProps> = ({ onClose }) => {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const { id: workspaceId } = useCurrentWorkspace()
  const { mutateAsync } = useCreateWorkspaceServiceAccount({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListWorkspaceAccountsQueryKey({
          queryParams: {
            workspaceId,
            type: 'service',
          },
        }),
      })
    },
  })

  const onSubmit = () => {
    mutateAsync({
      body: {
        name,
        role: 'member',
        workspaceId,
      },
    })
      .then(result => {
        alert(
          `Your API key is ${result.apiKey}. Make sure to copy it somewhere secure, it won't be available within the app in the future.`,
        )
        onClose()
        toast('success', {
          title: 'API key created',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not create API key',
        })
      })
  }

  const canBeSubmitted = name.length > 0

  return (
    <Box paddingTop="$space60" paddingBottom="$space60">
      <Form onSubmit={onSubmit}>
        <Stack direction="row" alignItems="flex-start" spacing="$space60">
          <TextField
            hideLabel
            label="Name"
            placeholder="Local development"
            autoFocus
            value={name}
            onChange={setName}
          />

          <Button
            variation="primary"
            isDisabled={!canBeSubmitted}
            type="submit"
          >
            Add
          </Button>

          <Button variation="secondary" type="button" onAction={onClose}>
            Close
          </Button>
        </Stack>
      </Form>
    </Box>
  )
}
