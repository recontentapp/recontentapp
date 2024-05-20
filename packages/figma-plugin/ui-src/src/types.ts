import {
  FileConfigResetRequested,
  FileConfigSet,
  NotificationRequested,
  PluginInitialized,
  TextsSyncReceived,
  TextSelectionChanged,
  UserConfigResetRequested,
  UserConfigUpdated,
  TextResetRequested,
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
  | TextsSyncReceived
  | TextResetRequested
