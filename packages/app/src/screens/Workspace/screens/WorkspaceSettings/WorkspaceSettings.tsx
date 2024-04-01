import { FC } from 'react'
import { Outlet } from 'react-router-dom'

import { Head } from '../../../../components/Head'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'

export const WorkspaceSettings: FC = () => {
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: 'Workspace settings',
          path: routes.workspaceSettingsMembers.url({
            pathParams: { workspaceKey },
          }),
        },
      ]}
    >
      <Head title="Workspace settings" />
      <Page
        title="Workspace settings"
        tabs={[
          {
            label: 'Members',
            to: routes.workspaceSettingsMembers.url({
              pathParams: { workspaceKey },
            }),
          },
          {
            label: 'Languages',
            to: routes.workspaceSettingsLanguages.url({
              pathParams: { workspaceKey },
            }),
          },
          {
            label: 'Integrations',
            to: routes.workspaceSettingsIntegrations.url({
              pathParams: { workspaceKey },
            }),
          },
        ]}
      >
        <Outlet />
      </Page>
    </ScreenWrapper>
  )
}
