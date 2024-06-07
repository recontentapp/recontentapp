import { Stack } from 'design-system'
import { useNavigate } from 'react-router-dom'
import { Components } from '../../../../../generated/typeDefinitions'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { useModals } from '../../../hooks/modals'
import { StepCard } from './StepCard'

interface OnboardingProps {
  languages: Components.Schemas.Language[]
}

export const Onboarding = ({ languages }: OnboardingProps) => {
  const navigate = useNavigate()
  const { key: workspaceKey } = useCurrentWorkspace()
  const { openCreateProject } = useModals()

  return (
    <Stack direction="row" spacing="$space100">
      <StepCard
        checked={languages.length > 0}
        title="Add languages to workspace"
        description="Languages can be reused across multiple projects"
        onAction={() =>
          navigate(
            routes.workspaceSettingsLanguages.url({
              pathParams: { workspaceKey },
            }),
          )
        }
      />
      <StepCard
        title="Create a project"
        disabled={languages.length === 0}
        description="It can be a website, mobile app or a specific feature handled by a team"
        onAction={openCreateProject}
      />
    </Stack>
  )
}
