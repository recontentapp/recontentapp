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
import { useCurrentWorkspace } from '../../hooks/workspace'
import routes from '../../routing'
import { useGetWorkspaceAbilities } from '../../generated/reactQuery'
import { FullpageSpinner } from '../../components/FullpageSpinner'
import { BillingBanner } from './components/BillingBanner'
import { styled } from '../../theme'
import { CreateWorkspace } from '../Onboarding/screens/CreateWorkspace'
import { JoinWorkspace } from '../Onboarding/screens/JoinWorkspace'
import { ProtectedRouteElement } from '../../components/ProtectedRouteElement'

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

                <Route
                  path="/:workspaceKey/create-another-workspace"
                  element={<CreateWorkspace />}
                />

                <Route
                  path="/:workspaceKey/join-another-workspace"
                  element={<JoinWorkspace />}
                />

                <Route
                  path="/:workspaceKey/settings"
                  element={<WorkspaceSettings />}
                >
                  <Route
                    path="members"
                    element={
                      <ProtectedRouteElement
                        component={WorkspaceMembers}
                        ability="members:manage"
                      />
                    }
                  />

                  <Route
                    path="languages"
                    element={
                      <ProtectedRouteElement
                        component={WorkspaceLanguages}
                        ability="languages:manage"
                      />
                    }
                  />

                  <Route
                    path="integrations"
                    element={
                      <ProtectedRouteElement
                        component={WorkspaceIntegrations}
                        ability="integrations:manage"
                      />
                    }
                  />

                  <Route
                    path="billing"
                    element={
                      <ProtectedRouteElement
                        component={WorkspaceBilling}
                        ability="billing:manage"
                      />
                    }
                  />

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

                <Route
                  path="/:workspaceKey/projects/:projectId/import/from-file"
                  element={<ImportFromFile />}
                />

                <Route
                  path="/:workspaceKey/projects/:projectId/destinations/:destinationId"
                  element={
                    <ProtectedRouteElement
                      component={Destination}
                      ability="projects:destinations:manage"
                    />
                  }
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
