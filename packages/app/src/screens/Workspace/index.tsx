import { Route, Routes } from 'react-router-dom'

import { Redirect } from '../Redirect'
import { KBar, KBarProvider } from './components/KBar'
import { Sidebar } from './components/Sidebar'
import { ModalsProvider } from './hooks/modals'
import { Dashboard } from './screens/Dashboard'
import {
  Project,
  Settings as ProjectSettings,
  Phrases as ProjectPhrases,
  Import as ProjectImport,
  Export as ProjectExport,
} from './screens/Project'
import { UserSettings } from './screens/UserSettings'
import {
  Integrations as WorkspaceIntegrations,
  Languages as WorkspaceLanguages,
  Members as WorkspaceMembers,
  Billing as WorkspaceBilling,
  WorkspaceSettings,
} from './screens/WorkspaceSettings'
import { ImportFromFile } from './screens/ImportFromFile'
import { Destination } from './screens/Destination'
import { useCurrentWorkspace, useHasAbility } from '../../hooks/workspace'
import routes from '../../routing'
import { useGetWorkspaceAbilities } from '../../generated/reactQuery'
import { FullpageSpinner } from '../../components/FullpageSpinner'
import { BillingBanner } from './components/BillingBanner'
import { styled } from '../../theme'

const MainContainer = styled('div', {
  height: '100vh',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: 'transparent',
})

const Inner = styled('div', {
  width: '100vw',
  height: '100%',
  position: 'relative',
  display: 'flex',
})

const Main = styled('main', {
  position: 'relative',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$white',
})

export const Workspace = () => {
  const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
  const { isPending: isLoadingAbilities } = useGetWorkspaceAbilities(
    {
      queryParams: {
        workspaceId,
      },
    },
    {
      staleTime: Infinity,
    },
  )

  const canManageMembers = useHasAbility('members:manage')
  const canManageLanguages = useHasAbility('languages:manage')
  const canManageIntegrations = useHasAbility('api_keys:manage')
  const canManageBilling = useHasAbility('billing:manage')

  const canAccessSettings =
    canManageMembers ||
    canManageLanguages ||
    canManageIntegrations ||
    canManageBilling

  if (isLoadingAbilities) {
    return <FullpageSpinner variation="primary" />
  }

  return (
    <KBarProvider>
      <ModalsProvider>
        <KBar />

        <MainContainer>
          <BillingBanner />

          <Inner>
            <Sidebar />

            <Main>
              <Routes>
                <Route path="/:workspaceKey" element={<Dashboard />} />

                <Route
                  path="/:workspaceKey/settings/user"
                  element={<UserSettings />}
                />

                {canAccessSettings && (
                  <Route
                    path="/:workspaceKey/settings"
                    element={<WorkspaceSettings />}
                  >
                    {canManageMembers && (
                      <Route path="members" element={<WorkspaceMembers />} />
                    )}
                    {canManageLanguages && (
                      <Route
                        path="languages"
                        element={<WorkspaceLanguages />}
                      />
                    )}
                    {canManageIntegrations && (
                      <Route
                        path="integrations"
                        element={<WorkspaceIntegrations />}
                      />
                    )}
                    {canManageBilling && (
                      <Route path="billing" element={<WorkspaceBilling />} />
                    )}
                    <Route
                      index
                      element={
                        <Redirect
                          to={routes.dashboard.url({
                            pathParams: { workspaceKey },
                          })}
                        />
                      }
                    />
                  </Route>
                )}

                <Route
                  path="/:workspaceKey/projects/:projectId/import/from-file"
                  element={<ImportFromFile />}
                />

                <Route
                  path="/:workspaceKey/projects/:projectId/destinations/:destinationId"
                  element={<Destination />}
                />

                <Route
                  path="/:workspaceKey/projects/:projectId"
                  element={<Project />}
                >
                  <Route path="import" element={<ProjectImport />} />
                  <Route path="export" element={<ProjectExport />} />
                  <Route path="settings" element={<ProjectSettings />} />
                  <Route path="phrases">
                    <Route path=":revisionId" element={<ProjectPhrases />} />
                  </Route>
                  <Route
                    path="*"
                    element={
                      <Redirect
                        to={routes.dashboard.url({
                          pathParams: { workspaceKey },
                        })}
                      />
                    }
                  />
                </Route>
                <Route
                  path="*"
                  element={
                    <Redirect
                      to={routes.dashboard.url({
                        pathParams: { workspaceKey },
                      })}
                    />
                  }
                />
              </Routes>
            </Main>
          </Inner>
        </MainContainer>
      </ModalsProvider>
    </KBarProvider>
  )
}
