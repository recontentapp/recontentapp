import { FC, useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { toDashboard, toProjectSettings } from '../../routes'
import { useGetProject } from '../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../hooks/workspace'

export const Project: FC = () => {
  const params = useParams<'projectId' | 'revisionId'>()
  const navigate = useNavigate()
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const {
    data: project,
    isLoading: projectLoading,
    failureCount,
  } = useGetProject({
    queryParams: {
      id: params.projectId!,
    },
  })

  useEffect(() => {
    if (failureCount > 0) {
      navigate(toDashboard(workspaceKey))
    }
  }, [failureCount, navigate, workspaceKey])

  if (projectLoading || !project) {
    return <FullpageSpinner />
  }

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: toDashboard(workspaceKey),
        },
        {
          label: project.name,
          path: toProjectSettings(workspaceKey, project.id),
        },
      ]}
    >
      <Head title={project.name} />
      <Page
        title={project.name}
        description={project.description ? project.description : undefined}
        tabs={[
          {
            label: 'Settings',
            to: toProjectSettings(workspaceKey, project.id),
          },
        ]}
      >
        <Outlet />
      </Page>
    </ScreenWrapper>
  )
}
