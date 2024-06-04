import { Components } from 'src/generated/typeDefinitions'

export const isValidDestinationSyncFrequency = (
  value: string,
): value is Components.Schemas.DestinationSyncFrequency => {
  return ['manually', 'daily', 'weekly'].includes(value)
}
