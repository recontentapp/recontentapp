import { Route, Routes } from 'react-router-dom'

import { FullpageSpinner } from '../../components/FullpageSpinner'
import { ProtectedRouteElement } from '../../components/ProtectedRouteElement'
import { useGetWorkspaceAbilities } from '../../generated/reactQuery'
import { useCurrentWorkspace } from '../../hooks/workspace'
import routes from '../../routing'
import { styled } from '../../theme'
import { CreateWorkspace } from '../Onboarding/screens/CreateWorkspace'
import { JoinWorkspace } from '../Onboarding/screens/JoinWorkspace'
import { Redirect } from '../Redirect'
import { BillingBanner } from './components/BillingBanner'
import { KBar, KBarProvider } from './components/KBar'
import { Sidebar } from './components/Sidebar'
import { ModalsProvider } from './hooks/modals'
import { Dashboard } from './screens/Dashboard'
import { Destination } from './screens/Destination'
import { Editor } from './screens/Editor/Editor'
import { Glossary } from './screens/Glossary/Glossary'
import { ImportFromFile } from './screens/ImportFromFile'
import {
  Project,
  Export as ProjectExport,
  Import as ProjectImport,
  Phrases as ProjectPhrases,
  Settings as ProjectSettings,
  UXWriting as ProjectUXWriting,
} from './screens/Project'
import { UserSettings } from './screens/UserSettings'
import {
  Billing as WorkspaceBilling,
  Glossaries as WorkspaceGlossaries,
  Integrations as WorkspaceIntegrations,
  Languages as WorkspaceLanguages,
  Members as WorkspaceMembers,
  Prompts as WorkspacePrompts,
  WorkspaceSettings,
} from './screens/WorkspaceSettings'

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
                    path="glossaries"
                    element={
                      <ProtectedRouteElement
                        component={WorkspaceGlossaries}
                        ability="glossaries:manage"
                      />
                    }
                  />

                  <Route
                    path="prompts"
                    element={
                      <ProtectedRouteElement
                        component={WorkspacePrompts}
                        ability="prompts:manage"
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
                  path="/:workspaceKey/glossaries/:glossaryId"
                  element={<Glossary />}
                />

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
                  path="/:workspaceKey/projects/:projectId/phrases/:revisionId/editor"
                  element={<Editor />}
                />

                <Route
                  path="/:workspaceKey/projects/:projectId"
                  element={<Project />}
                >
                  <Route path="import" element={<ProjectImport />} />
                  <Route path="export" element={<ProjectExport />} />
                  <Route path="ux-writing" element={<ProjectUXWriting />} />
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
