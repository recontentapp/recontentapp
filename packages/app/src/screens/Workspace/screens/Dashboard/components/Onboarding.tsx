import { useNavigate } from 'react-router-dom'
import { Stack } from '../../../../../components/primitives'
import { useModals } from '../../../hooks/modals'
import { StepCard } from './StepCard'
import { toWorkspaceSettingsLanguages } from '../../../routes'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { Components } from '../../../../../generated/typeDefinitions'

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
        onAction={() => navigate(toWorkspaceSettingsLanguages(workspaceKey))}
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
