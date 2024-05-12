import {
  PluginInitialized,
  FileConfigResetRequested,
  UserConfigResetRequested,
} from '../../shared-types'

export type Emittable = PluginInitialized

export type Receivable =
  | FileConfigResetRequested['type']
  | UserConfigResetRequested['type']
