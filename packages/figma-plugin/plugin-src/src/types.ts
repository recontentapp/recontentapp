import {
  PluginInitialized,
  FileConfigResetRequested,
  UserConfigResetRequested,
  UserConfigUpdated,
  FileConfigSet,
  NotificationRequested,
  TextSelectionChanged,
} from '../../shared-types'

export type Emittable = PluginInitialized | TextSelectionChanged

export type Receivable =
  | FileConfigResetRequested['type']
  | UserConfigResetRequested['type']
  | UserConfigUpdated['type']
  | FileConfigSet['type']
  | NotificationRequested['type']
