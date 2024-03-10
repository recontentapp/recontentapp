import { Paths } from '../generated/typeDefinitions'

export type Status = 'idle' | 'loading' | 'authenticated' | 'error'

export type CurrentUser = Paths.GetCurrentUser.Responses.$200
