import { Stack } from 'design-system'
import { useParams } from 'react-router-dom'
import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import { useListGlossaries } from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { LinkGlossary } from '../components/LinkGlossary'
import { ProjectGlossary } from '../components/ProjectGlossary'
import { ProjectPrompts } from '../components/ProjectPrompts'

const useProjectGlossaryId = () => {
  const { id: workspaceId } = useCurrentWorkspace()
  const params = useParams<'projectId'>()
  const { data: glossariesData, isPending } = useListGlossaries(
    {
      queryParams: { workspaceId, projectId: params.projectId! },
    },
    { staleTime: Infinity },
  )
  const glossaryId = glossariesData?.items.at(0)?.id
    ? String(glossariesData.items[0].id)
    : null

  return { glossaryId, isPending }
}

export const UXWriting = () => {
  const params = useParams<'projectId'>()
  const { glossaryId, isPending } = useProjectGlossaryId()

  if (isPending) {
    return <HorizontalSpinner />
  }

  return (
    <Stack direction="column" spacing="$space300">
      <ProjectPrompts projectId={params.projectId!} />

      {glossaryId ? (
        <ProjectGlossary
          projectId={params.projectId!}
          glossaryId={glossaryId}
        />
      ) : (
        <LinkGlossary projectId={params.projectId!} />
      )}
    </Stack>
  )
}
