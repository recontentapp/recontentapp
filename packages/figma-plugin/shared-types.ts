/**
 * This file is shared between the Figma plugin and the Figma plugin UI.
 */

/**
 * Recontent.app can be self-hosted
 * users can provide custom origins
 * to make API requests
 */
export type CustomOrigin = string | null

export interface UserCredentials {
  customOrigin: CustomOrigin
  workspaceId: string
  workspaceKey: string
  apiKey: string
}

export interface UserConfig {
  credentials: UserCredentials[]
}

export interface FileConfig {
  id: string
  languageId: string
  revisionId: string
  workspaceId: string
  workspaceKey: string
  customOrigin: CustomOrigin
}

export interface Text {
  figma: {
    pageNodeId: string
    nodeId: string
    content: string
  }
  app: {
    id: string
    phraseId: string
    phraseKey: string
    content: string | null
  } | null
  appLastSyncedAt: number | null
}

export interface PluginInitialized {
  type: 'plugin-initialized'
  data: {
    userConfig: UserConfig | null
    fileConfig: FileConfig | null
    fileName: string
    selection: {
      texts: Text[]
      traversed: boolean
    }
  }
}

export interface UserConfigUpdated {
  type: 'user-config-updated'
  data: UserConfig
}

export interface FileConfigSet {
  type: 'file-config-set'
  data: FileConfig
}

export interface FileConfigResetRequested {
  type: 'file-config-reset-requested'
}

export interface UserConfigResetRequested {
  type: 'user-config-reset-requested'
}

export interface NotificationRequested {
  type: 'notification-requested'
  data: {
    message: string
    type?: 'success' | 'error'
  }
}

export interface TextSelectionChanged {
  type: 'text-selection-changed'
  data: {
    texts: Text[]
    traversed: boolean
  }
}
