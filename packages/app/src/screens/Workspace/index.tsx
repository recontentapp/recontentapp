import { Route, Routes } from 'react-router-dom'

import { styled } from '../../theme'
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
  WorkspaceSettings,
} from './screens/WorkspaceSettings'
import { ImportFromFile } from './screens/ImportFromFile'
import { Destination } from './screens/Destination'
import { useCurrentWorkspace, useHasAbility } from '../../hooks/workspace'
import routes from '../../routing'

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
  const { key: workspaceKey } = useCurrentWorkspace()
  const canManageMembers = useHasAbility('members:manage')
  const canManageLanguages = useHasAbility('languages:manage')
  const canManageIntegrations = useHasAbility('api_keys:manage')

  const canAdmin =
    canManageMembers || canManageLanguages || canManageIntegrations

  return (
    <KBarProvider>
      <ModalsProvider>
        <KBar />

        <MainContainer>
          <Inner>
            <Sidebar />

            <Main>
              <Routes>
                <Route path="/:workspaceKey" element={<Dashboard />} />

                <Route
                  path="/:workspaceKey/settings/user"
                  element={<UserSettings />}
                />

                {canAdmin && (
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
