import { Box, Heading, Stack, Text } from 'design-system'
import { FC, useMemo } from 'react'
import { Components } from '../../../../../generated/typeDefinitions'
import { styled } from '../../../../../theme'
import { DestinationBadge } from '../../../components/DestinationBadge'

export interface DestinationCardProps {
  destination: Components.Schemas.DestinationItem
  onAction: () => void
}

const Container = styled('div', {
  position: 'relative',
  width: 200,
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  cursor: 'pointer',
  transition: 'all 0.1s ease-in-out',
  paddingY: '$space80',
  paddingX: '$space80',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  '&::after': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    content: '',
    display: 'block',
    width: '100%',
    height: 3,
    backgroundColor: '$blue900',
    borderTopRightRadius: '$radius200',
    borderTopLeftRadius: '$radius200',
  },
  '&:hover': {
    backgroundColor: '$gray2',
  },
})

const Dot = styled('div', {
  width: 6,
  height: 6,
  borderRadius: '50%',
  variants: {
    color: {
      red: {
        backgroundColor: '$red100',
      },
      green: {
        backgroundColor: '$green100',
      },
      grey: {
        backgroundColor: '$gray9',
      },
    },
  },
})

interface DotConfig {
  label: string
  color: 'green' | 'red' | 'grey'
}

export const DestinationCard: FC<DestinationCardProps> = ({
  destination,
  onAction,
}) => {
  const { color, label } = useMemo((): DotConfig => {
    if (!destination.active) {
      return {
        color: 'red',
        label: 'Inactive',
      }
    }

    if (destination.lastSyncError) {
      return {
        color: 'red',
        label: 'In error',
      }
    }

    if (destination.active && destination.lastSuccessfulSyncAt !== null) {
      return {
        color: 'green',
        label: 'Live',
      }
    }

    return {
      color: 'grey',
      label: 'No data',
    }
  }, [destination])

  return (
    <Container role="button" tabIndex={0} onClick={onAction}>
      <Stack direction="column" spacing="$space80">
        <Stack direction="column" spacing="$space40">
          <Heading size="$size80" renderAs="span" maxWidth={200} withEllipsis>
            {destination.name}
          </Heading>

          <Stack direction="row" spacing="$space40" alignItems="center">
            <Dot color={color} />
            <Text size="$size60" color="$gray11">
              {label}
            </Text>
          </Stack>
        </Stack>

        <Box>
          <DestinationBadge type={destination.type} />
        </Box>
      </Stack>
    </Container>
  )
}
