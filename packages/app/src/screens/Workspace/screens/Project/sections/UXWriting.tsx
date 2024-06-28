import { Stack } from 'design-system'
import { useParams } from 'react-router-dom'
import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import { useGetProject } from '../../../../../generated/reactQuery'
import { LinkGlossary } from '../components/LinkGlossary'
import { ProjectGlossary } from '../components/ProjectGlossary'
import { ProjectPrompts } from '../components/ProjectPrompts'

export const UXWriting = () => {
  const params = useParams<'projectId'>()
  const { data, isPending } = useGetProject({
    queryParams: { id: params.projectId! },
  })

  if (!data || isPending) {
    return <HorizontalSpinner />
  }

  const glossaryId = data.glossaries.at(0) ?? null

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
