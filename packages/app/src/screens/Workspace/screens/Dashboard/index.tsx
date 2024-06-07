import { FC } from 'react'

import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import {
  useListProjects,
  useListWorkspaceLanguages,
} from '../../../../generated/reactQuery'
import { useCurrentWorkspace, useHasAbility } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { Onboarding } from './components/Onboarding'
import { ProjectsList } from './components/ProjectsList'

export const Dashboard: FC = () => {
  const {
    name: workspaceName,
    key: workspaceKey,
    id: workspaceId,
  } = useCurrentWorkspace()
  const canManageLanguages = useHasAbility('languages:manage')
  const { data: languages, isPending: isLoadingLanguages } =
    useListWorkspaceLanguages({
      queryParams: {
        workspaceId,
      },
    })
  const { data: projectsData, isPending: isLoadingProjects } = useListProjects({
    queryParams: {
      workspaceId,
      page: 1,
      pageSize: 50,
    },
  })

  if (isLoadingLanguages || isLoadingProjects) {
    return <FullpageSpinner />
  }

  const shouldShowOnboarding =
    (projectsData?.items.length === 0 || languages?.length === 0) &&
    canManageLanguages

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
      ]}
    >
      <Head title="Dashboard" />
      <Page title={shouldShowOnboarding ? "Let's get started!" : 'Projects'}>
        {shouldShowOnboarding ? (
          <Onboarding languages={languages ?? []} />
        ) : (
          <ProjectsList projects={projectsData?.items ?? []} />
        )}
      </Page>
    </ScreenWrapper>
  )
}
