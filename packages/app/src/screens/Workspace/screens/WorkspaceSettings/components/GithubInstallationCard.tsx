import { Badge, Box, GithubIcon, Heading, Stack, Text } from 'design-system'
import { FC } from 'react'
import { styled } from '../../../../../theme'

export interface GithubInstallationCardProps {
  title: string
  createdBy: string
  active: boolean
  onAction: () => void
}

const Container = styled('div', {
  position: 'relative',
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
    borderTopRightRadius: '$radius200',
    borderTopLeftRadius: '$radius200',
    backgroundColor: '$blue900',
  },
  '&:hover': {
    backgroundColor: '$gray2',
  },
})

export const GithubInstallationCard: FC<GithubInstallationCardProps> = ({
  title,
  createdBy,
  onAction,
  active,
}) => {
  return (
    <Container role="button" tabIndex={0} onClick={onAction}>
      <Stack direction="row" spacing="$space60" alignItems="flex-start">
        <GithubIcon width={20} />

        <Stack direction="column" spacing="$space60">
          <Stack direction="column" spacing="$space20">
            <Heading size="$size80" renderAs="span" maxWidth={200} withEllipsis>
              {title}
            </Heading>

            <Text size="$size60" variation="bold" color="$gray11">
              {createdBy}
            </Text>
          </Stack>

          <Box>
            <Badge variation={active ? 'success' : 'danger'} size="xsmall">
              {active ? 'Active' : 'Inactive'}
            </Badge>
          </Box>
        </Stack>
      </Stack>
    </Container>
  )
}
