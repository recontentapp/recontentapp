import { RoutesCollection } from '../../routing-types'

const routes: RoutesCollection = {
  '/:workspaceKey': {
    name: 'dashboard',
  },
  '/:workspaceKey/create-another-workspace': {
    name: 'createAnotherWorkspace',
  },
  '/:workspaceKey/join-another-workspace': {
    name: 'joinAnotherWorkspace',
  },
  '/:workspaceKey/settings/billing': {
    name: 'workspaceSettingsBilling',
  },
  '/:workspaceKey/settings/languages': {
    name: 'workspaceSettingsLanguages',
  },
  '/:workspaceKey/settings/glossaries': {
    name: 'workspaceSettingsGlossaries',
  },
  '/:workspaceKey/settings/prompts': {
    name: 'workspaceSettingsPrompts',
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
  '/:workspaceKey/glossaries/:glossaryId': {
    name: 'glossary',
  },
}

export default routes
