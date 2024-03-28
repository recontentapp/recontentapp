import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Stack } from '../../../../../components/primitives'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { toProjectImportFromFile } from '../../../routes'
import { ImportCard } from '../components/ImportCard'

export const Import: FC = () => {
  const navigate = useNavigate()
  const { getName } = useReferenceableAccounts()
  const params = useParams<'projectId'>()
  const { key: workspaceKey } = useCurrentWorkspace()

  return (
    <Stack width="100%" direction="column" spacing="$space300">
      <Stack direction="row" spacing="$space100">
        <ImportCard
          variation="secondary"
          title="From a file"
          description="JSON, Yaml, CSV, Excel"
          icon="file"
          onAction={() =>
            navigate(toProjectImportFromFile(workspaceKey, params.projectId!))
          }
        />
      </Stack>
    </Stack>
  )
}
