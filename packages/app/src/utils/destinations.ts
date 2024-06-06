import { Components } from '../generated/typeDefinitions'

export const destinationTypeLabels: Record<
  Components.Schemas.DestinationType,
  string
> = {
  cdn: 'CDN',
  aws_s3: 'AWS S3',
  google_cloud_storage: 'Google Cloud Storage',
  github: 'GitHub',
}

export const destinationSyncFrequencyLabels: Record<
  Components.Schemas.DestinationSyncFrequency,
  string
> = {
  manually: 'Manually',
  daily: 'Daily',
  weekly: 'Weekly',
}
