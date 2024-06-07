import {
  FileConfigResetRequested,
  FileConfigSet,
  NotificationRequested,
  PluginInitialized,
  TextResetRequested,
  TextSelectionChanged,
  TextsSyncReceived,
  UserConfigResetRequested,
  UserConfigUpdated,
} from '../../shared-types'

export type Emittable = PluginInitialized | TextSelectionChanged

export type Receivable =
  | FileConfigResetRequested['type']
  | UserConfigResetRequested['type']
  | UserConfigUpdated['type']
  | FileConfigSet['type']
  | NotificationRequested['type']
  | TextsSyncReceived['type']
  | TextResetRequested['type']
