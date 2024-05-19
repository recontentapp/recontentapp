import {
  PluginInitialized,
  FileConfigResetRequested,
  UserConfigResetRequested,
  UserConfigUpdated,
  FileConfigSet,
  NotificationRequested,
} from '../../shared-types'

export type Emittable = PluginInitialized

export type Receivable =
  | FileConfigResetRequested['type']
  | UserConfigResetRequested['type']
  | UserConfigUpdated['type']
  | FileConfigSet['type']
  | NotificationRequested['type']
