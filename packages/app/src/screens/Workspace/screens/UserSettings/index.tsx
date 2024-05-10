import { FC } from 'react'

import { Head } from '../../../../components/Head'
import { Stack } from '../../../../components/primitives'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { Global } from './components/Global'
import { Workspace } from './components/Workspace'

export const UserSettings: FC = () => {
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: 'User settings',
          path: routes.userSettings.url({ pathParams: { workspaceKey } }),
        },
      ]}
    >
      <Head title="User settings" />

      <Page title="User settings">
        <Stack direction="column" spacing="$space400">
          <Global />
          <Workspace />
        </Stack>
      </Page>
    </ScreenWrapper>
  )
}
