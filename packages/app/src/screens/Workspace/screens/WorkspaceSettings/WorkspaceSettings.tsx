import { FC } from 'react'
import { Outlet } from 'react-router-dom'

import { Head } from '../../../../components/Head'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import {
  toDashboard,
  toWorkspaceSettingsIntegrations,
  toWorkspaceSettingsLanguages,
  toWorkspaceSettingsMembers,
} from '../../routes'
import { useCurrentWorkspace } from '../../../../hooks/workspace'

export const WorkspaceSettings: FC = () => {
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: toDashboard(workspaceKey),
        },
        {
          label: 'Workspace settings',
          path: toWorkspaceSettingsMembers(workspaceKey),
        },
      ]}
    >
      <Head title="Workspace settings" />
      <Page
        title="Workspace settings"
        tabs={[
          {
            label: 'Members',
            to: toWorkspaceSettingsMembers(workspaceKey),
          },
          {
            label: 'Languages',
            to: toWorkspaceSettingsLanguages(workspaceKey),
          },
          {
            label: 'Integrations',
            to: toWorkspaceSettingsIntegrations(workspaceKey),
          },
        ]}
      >
        <Outlet />
      </Page>
    </ScreenWrapper>
  )
}
