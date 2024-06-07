import { FC, useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import { useGetProject } from '../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { useKBarContext } from '../../components/KBar'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'

export const Project: FC = () => {
  const params = useParams<'projectId' | 'revisionId'>()
  const navigate = useNavigate()
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const { setProjectContext } = useKBarContext()
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
    if (!project) {
      return
    }

    setProjectContext(project, params.revisionId || project.masterRevisionId)

    return () => {
      setProjectContext(null, null)
    }
  }, [project, params.revisionId, setProjectContext])

  useEffect(() => {
    if (failureCount > 0) {
      navigate(routes.dashboard.url({ pathParams: { workspaceKey } }))
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
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: project.name,
          path: routes.projectPhrases.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
              revisionId: project.masterRevisionId,
            },
          }),
        },
      ]}
    >
      <Head title={project.name} />
      <Page
        title={project.name}
        description={project.description ? project.description : undefined}
        tabs={[
          {
            label: 'Phrases',
            to: routes.projectPhrases.url({
              pathParams: {
                workspaceKey,
                projectId: project.id,
                revisionId: project.masterRevisionId,
              },
            }),
          },
          {
            label: 'Import',
            to: routes.projectImport.url({
              pathParams: {
                workspaceKey,
                projectId: project.id,
              },
            }),
          },
          {
            label: 'Export',
            to: routes.projectExport.url({
              pathParams: {
                workspaceKey,
                projectId: project.id,
              },
            }),
          },
          {
            label: 'Settings',
            to: routes.projectSettings.url({
              pathParams: { workspaceKey, projectId: project.id },
            }),
          },
        ]}
      >
        <Outlet />
      </Page>
    </ScreenWrapper>
  )
}
