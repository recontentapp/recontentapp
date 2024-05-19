import { Button, Stack } from 'design-system'
import { useBridge } from '../contexts/Bridge'
import { UserCredentials } from '../../../shared-types'

interface SelectCredentialsProps {
  onSelect: (credentials: UserCredentials) => void
  onUpdate: () => void
}

export const SelectCredentials = ({
  onSelect,
  onUpdate,
}: SelectCredentialsProps) => {
  const { userConfig, emit } = useBridge()

  return (
    <Stack
      width="100%"
      direction="column"
      spacing="$space100"
      alignItems="center"
      justifyContent="center"
    >
      {userConfig?.credentials.map(credential => (
        <button onClick={() => onSelect(credential)}>
          {credential.workspaceKey} (
          {credential.customOrigin ?? 'Recontent.app'})
        </button>
      ))}

      <Button variation="primary" onAction={onUpdate}>
        Update credentials
      </Button>

      <Button
        variation="primary"
        onAction={() => emit({ type: 'user-config-reset-requested' })}
      >
        Reset credentials
      </Button>
    </Stack>
  )
}
