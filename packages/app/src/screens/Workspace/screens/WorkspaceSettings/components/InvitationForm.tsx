import { FC, useState } from 'react'

import {
  Box,
  Button,
  SelectField,
  Stack,
  TextField,
  toast,
} from '../../../../../components/primitives'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { useInviteToWorkspace } from '../../../../../generated/reactQuery'
import { Components } from '../../../../../generated/typeDefinitions'

interface InvitationFormProps {
  onClose: () => void
}

interface State {
  email: string
  role: Components.Schemas.WorkspaceAccountRole
}

export const InvitationForm: FC<InvitationFormProps> = ({ onClose }) => {
  const { mutateAsync, isPending } = useInviteToWorkspace()
  const { id: workspaceId } = useCurrentWorkspace()
  const [state, setState] = useState<State>({ email: '', role: 'member' })

  const onSubmit = () => {
    mutateAsync({
      body: {
        email: state.email,
        role: state.role,
        workspaceId,
      },
    })
      .then(() => {
        onClose()
        toast('success', {
          title: 'Invitation sent',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not send invitation',
        })
      })
  }

  const canBeSubmitted = state.email.length > 0 && !!state.role

  return (
    <Box paddingTop="$space60" paddingBottom="$space60">
      <Stack direction="row" alignItems="flex-start" spacing="$space60">
        <TextField
          hideLabel
          label="Email"
          placeholder="john@example.com"
          autoFocus
          value={state.email}
          onChange={value => setState(state => ({ ...state, email: value }))}
        />

        <SelectField
          label="Role"
          hideLabel
          value={state.role}
          onChange={value => {
            if (!value) {
              return
            }

            setState(state => ({
              ...state,
              role: value.value as Components.Schemas.WorkspaceAccountRole,
            }))
          }}
          options={[
            {
              label: 'Owner',
              value: 'owner',
            },
            {
              label: 'Admin',
              value: 'admin',
            },
            {
              label: 'Member',
              value: 'member',
            },
          ]}
        />

        <Button
          variation="primary"
          isDisabled={!canBeSubmitted}
          isLoading={isPending}
          onAction={onSubmit}
        >
          Invite
        </Button>

        <Button variation="secondary" onAction={onClose}>
          Close
        </Button>
      </Stack>
    </Box>
  )
}
