import { FC } from 'react'
import { Heading, Stack, Text } from 'design-system'
import { styled } from '../../../../../theme'

export interface ProgressCardProps {
  label: string
  percentage: string
}

const Container = styled('div', {
  position: 'relative',
  minWidth: 140,
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
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
})

const ProgressBar = styled('div', {
  position: 'relative',
  backgroundColor: '$gray4',
  width: '100%',
  height: 5,
  '&::after': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    content: '',
    display: 'block',
    borderRadius: '$radius200',
    height: '100%',
    backgroundColor: '$purple500',
  },
})

export const ProgressCard: FC<ProgressCardProps> = ({ label, percentage }) => {
  return (
    <Container>
      <Stack direction="column" spacing="$space60">
        <Heading size="$size80" renderAs="span" maxWidth={200} withEllipsis>
          {label}
        </Heading>

        <Stack direction="column" spacing="$space40">
          <Text color="$gray11" size="$size60">
            {percentage}
          </Text>

          <ProgressBar
            role="progressbar"
            aria-valuenow={Number(percentage.replace('%', ''))}
            aria-valuemin={0}
            aria-valuemax={100}
            css={{
              '&::after': {
                width: percentage,
              },
            }}
          />
        </Stack>
      </Stack>
    </Container>
  )
}
