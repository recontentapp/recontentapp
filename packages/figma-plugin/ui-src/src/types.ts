import {
  FileConfigResetRequested,
  FileConfigSet,
  NotificationRequested,
  PluginInitialized,
  TextSelectionChanged,
  UserConfigResetRequested,
  UserConfigUpdated,
} from '../../shared-types'

export type Receivable =
  | PluginInitialized['type']
  | TextSelectionChanged['type']

export type Emittable =
  | UserConfigResetRequested
  | FileConfigResetRequested
  | UserConfigUpdated
  | FileConfigSet
  | NotificationRequested
