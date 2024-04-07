import { FC } from 'react'
import { Icon, IconName } from '../../../components/primitives'
import { styled } from '../../../theme'
import { Components } from '../../../generated/typeDefinitions'
import { destinationTypeLabels } from '../../../utils/destinations'

const Container = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: '$space20',
  fontWeight: 500,
  lineHeight: 1,
  paddingX: '$space40',
  paddingY: '$space20',
  backgroundColor: '$white',
  color: '$gray14',
  fontSize: '$size60',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  boxShadow: '$shadow100',
})

interface DestinationBadgeProps {
  type: Components.Schemas.DestinationType
}

const iconMap: Record<Components.Schemas.DestinationType, IconName> = {
  google_cloud_storage: 'google_cloud',
  aws_s3: 'aws',
  cdn: 'cloud_upload',
}

export const DestinationBadge: FC<DestinationBadgeProps> = ({ type }) => {
  return (
    <Container>
      <Icon src={iconMap[type]} size={20} color="$gray14" />
      {destinationTypeLabels[type]}
    </Container>
  )
}