import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Stack } from '../../../../../components/primitives'
import { ImportCard } from '../components/ImportCard'
import routes from '../../../../../routing'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

export const Import: FC = () => {
  const { key: workspaceKey } = useCurrentWorkspace()
  const params = useParams<'projectId'>()
  const navigate = useNavigate()

  return (
    <Stack width="100%" direction="column" spacing="$space300">
      <Stack direction="row" spacing="$space100">
        <ImportCard
          variation="secondary"
          title="From a file"
          description="JSON, Yaml, CSV, Excel"
          icon="file"
          onAction={() =>
            navigate(
              routes.projectImportFromFile.url({
                pathParams: {
                  workspaceKey,
                  projectId: params.projectId!,
                },
              }),
            )
          }
        />
      </Stack>
    </Stack>
  )
}
