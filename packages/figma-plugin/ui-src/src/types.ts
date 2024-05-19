import {
  FileConfigResetRequested,
  FileConfigSet,
  NotificationRequested,
  PluginInitialized,
  UserConfigResetRequested,
  UserConfigUpdated,
} from '../../shared-types'

export type Receivable = PluginInitialized['type']

export type Emittable =
  | UserConfigResetRequested
  | FileConfigResetRequested
  | UserConfigUpdated
  | FileConfigSet
  | NotificationRequested
