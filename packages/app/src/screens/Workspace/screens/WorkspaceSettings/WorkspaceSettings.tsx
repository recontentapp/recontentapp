import { FC } from 'react'
import { Outlet } from 'react-router-dom'

import { Head } from '../../../../components/Head'
import { useCurrentWorkspace, useHasAbility } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'

export const WorkspaceSettings: FC = () => {
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const canManageBilling = useHasAbility('billing:manage')
  const canManageIntegrations = useHasAbility('integrations:manage')
  const canManageLanguages = useHasAbility('languages:manage')
  const canManageMembers = useHasAbility('members:manage')
  const canManageGlossaries = useHasAbility('glossaries:manage')

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
          ...(canManageMembers
            ? [
                {
                  label: 'Members',
                  to: routes.workspaceSettingsMembers.url({
                    pathParams: { workspaceKey },
                  }),
                },
              ]
            : []),
          ...(canManageLanguages
            ? [
                {
                  label: 'Languages',
                  to: routes.workspaceSettingsLanguages.url({
                    pathParams: { workspaceKey },
                  }),
                },
              ]
            : []),
          ...(canManageGlossaries
            ? [
                {
                  label: 'Glossaries',
                  to: routes.workspaceSettingsGlossaries.url({
                    pathParams: { workspaceKey },
                  }),
                },
              ]
            : []),
          ...(canManageIntegrations
            ? [
                {
                  label: 'Integrations',
                  to: routes.workspaceSettingsIntegrations.url({
                    pathParams: { workspaceKey },
                  }),
                },
              ]
            : []),
          ...(canManageBilling
            ? [
                {
                  label: 'Billing',
                  to: routes.workspaceSettingsBilling.url({
                    pathParams: { workspaceKey },
                  }),
                },
              ]
            : []),
        ]}
      >
        <Outlet />
      </Page>
    </ScreenWrapper>
  )
}
