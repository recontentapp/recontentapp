import { RoutesCollection } from '../../routing-types'

const routes: RoutesCollection = {
  '/:workspaceKey': {
    name: 'dashboard',
  },
  '/:workspaceKey/settings/languages': {
    name: 'workspaceSettingsLanguages',
  },
  '/:workspaceKey/settings/integrations': {
    name: 'workspaceSettingsIntegrations',
  },
  '/:workspaceKey/settings/members': {
    name: 'workspaceSettingsMembers',
  },
  '/:workspaceKey/settings/user': {
    name: 'userSettings',
  },
  '/:workspaceKey/projects/:projectId/phrases/:revisionId': {
    name: 'projectPhrases',
  },
  '/:workspaceKey/projects/:projectId/settings': {
    name: 'projectSettings',
  },
  '/:workspaceKey/projects/:projectId/import': {
    name: 'projectImport',
  },
  '/:workspaceKey/projects/:projectId/import/from-file': {
    name: 'projectImportFromFile',
  },
  '/:workspaceKey/projects/:projectId/export': {
    name: 'projectExport',
  },
  '/:workspaceKey/projects/:projectId/destinations/:destinationId': {
    name: 'projectDestination',
  },
}

export default routes
