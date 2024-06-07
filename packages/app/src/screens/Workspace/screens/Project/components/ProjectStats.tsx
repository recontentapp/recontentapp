import { Stack } from 'design-system'
import {
  useGetProject,
  useGetProjectStats,
} from '../../../../../generated/reactQuery'
import { ProgressCard } from './ProgressCard'

interface Props {
  projectId: string
}

export const ProjectStats = ({ projectId }: Props) => {
  const { data: project } = useGetProject({
    queryParams: {
      id: projectId,
    },
  })
  const { data } = useGetProjectStats({
    queryParams: {
      projectId,
    },
  })

  if (!data || !project) {
    return null
  }

  return (
    <Stack renderAs="ul" flexWrap="wrap" direction="row" spacing="$space100">
      {data.translations.map(stat => {
        const language = project.languages.find(
          language => language.id === stat.languageId,
        )

        return (
          <Stack
            renderAs="li"
            direction="column"
            spacing="$space20"
            key={stat.languageId}
          >
            <ProgressCard
              label={String(language?.name)}
              percentage={stat.percentage}
            />
          </Stack>
        )
      })}
    </Stack>
  )
}
