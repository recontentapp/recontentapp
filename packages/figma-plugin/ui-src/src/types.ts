import {
  FileConfigResetRequested,
  PluginInitialized,
  UserConfigResetRequested,
} from '../../shared-types'

export type Receivable = PluginInitialized['type']

export type Emittable = UserConfigResetRequested | FileConfigResetRequested
