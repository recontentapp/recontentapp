import { FC } from 'react'

import { FullpageSpinner } from '../../../components/FullpageSpinner'
import { Head } from '../../../components/Head'
import { Stack } from '../../../components/primitives'
import { useCurrentWorkspace } from '../../../hooks/workspace'
import { AddCard } from '../components/AddCard'
import { Card } from '../components/Card'
import { Page } from '../components/Page'
import { ScreenWrapper } from '../components/ScreenWrapper'
import { useModals } from '../hooks/modals'
import { toDashboard, toProjectSettings } from '../routes'
import { useListProjects } from '../../../generated/reactQuery'

export const Dashboard: FC = () => {
  const {
    name: workspaceName,
    key: workspaceKey,
    id: workspaceId,
  } = useCurrentWorkspace()
  const { data, isLoading } = useListProjects({
    queryParams: {
      workspaceId,
      page: 1,
      pageSize: 50,
    },
  })
  const { openCreateProject } = useModals()

  if (isLoading) {
    return <FullpageSpinner />
  }

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: toDashboard(workspaceKey),
        },
      ]}
    >
      <Head title="Dashboard" />
      <Page title="Projects" tabs={[]}>
        <Stack renderAs="ul" direction="row" spacing="$space100">
          {data?.items.map(project => (
            <li key={project.id}>
              <Card
                to={toProjectSettings(workspaceKey, project.id)}
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
      </Page>
    </ScreenWrapper>
  )
}
