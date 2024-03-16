import { FC, useState } from 'react'

import {
  Box,
  Button,
  Stack,
  TextField,
} from '../../../../../components/primitives'

interface AddAPIKeyFormProps {
  onClose: () => void
}

export const AddAPIKeyForm: FC<AddAPIKeyFormProps> = ({ onClose }) => {
  const [name, setName] = useState('')

  const onSubmit = () => {
    // mutateAsync({
    //   name,
    //   workspace_id: workspaceId,
    // })
    //   .then(result => {
    //     alert(
    //       `Your API key is ${result.key}. Make sure to copy it somewhere secure, it won't be available within the app in the future.`,
    //     )
    //     onClose()
    //     toast('success', {
    //       title: 'API key created',
    //     })
    //   })
    //   .catch(() => {
    //     toast('error', {
    //       title: 'Could not create API key',
    //     })
    //   })
  }

  const canBeSubmitted = name.length > 0

  return (
    <Box paddingTop="$space60" paddingBottom="$space60">
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
          onAction={onSubmit}
        >
          Add
        </Button>

        <Button variation="secondary" onAction={onClose}>
          Close
        </Button>
      </Stack>
    </Box>
  )
}
