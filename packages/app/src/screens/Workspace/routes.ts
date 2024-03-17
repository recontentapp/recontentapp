export const toUserSettings = (workspaceKey: string) =>
  `/${workspaceKey}/settings/user`
export const toDashboard = (workspaceKey: string) => `/${workspaceKey}`
export const toProjectSettings = (workspaceKey: string, projectId: string) =>
  `/${workspaceKey}/projects/${projectId}/settings`
export const toWorkspaceSettingsLanguages = (workspaceKey: string) =>
  `/${workspaceKey}/settings/languages`
export const toWorkspaceSettingsIntegrations = (workspaceKey: string) =>
  `/${workspaceKey}/settings/integrations`
export const toWorkspaceSettingsMembers = (workspaceKey: string) =>
  `/${workspaceKey}/settings/members`
