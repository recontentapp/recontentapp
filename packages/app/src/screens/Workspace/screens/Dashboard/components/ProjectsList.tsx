import { Stack } from '../../../../../components/primitives'
import { Components } from '../../../../../generated/typeDefinitions'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { AddCard } from '../../../components/AddCard'
import { Card } from '../../../components/Card'
import { useModals } from '../../../hooks/modals'
import { toProjectPhrases } from '../../../routes'

interface ProjectsListProps {
  projects: Components.Schemas.Project[]
}

export const ProjectsList = ({ projects }: ProjectsListProps) => {
  const { key: workspaceKey } = useCurrentWorkspace()
  const { openCreateProject } = useModals()

  return (
    <Stack renderAs="ul" direction="row" spacing="$space100">
      {projects.map(project => (
        <li key={project.id}>
          <Card
            to={toProjectPhrases(
              workspaceKey,
              project.id,
              project.masterRevisionId,
            )}
            id={project.id}
            title={project.name}
            date={new Date(project.updatedAt)}
          />
        </li>
      ))}
      <AddCard
        title="Create a project"
        description="It can be a website, mobile app or a specific feature handled by a team"
        onAction={() => openCreateProject()}
      />
    </Stack>
  )
}
