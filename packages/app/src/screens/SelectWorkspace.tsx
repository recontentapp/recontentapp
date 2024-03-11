import { FC } from 'react'

import { Avatar, Box, Heading, Stack, Text } from '../components/primitives'
import { styled } from '../theme'
import { useCurrentUser } from '../auth'
import { useLooseCurrentWorkspace } from '../hooks/workspace'

interface CardProps {
  id: string
  title: string
  onAction: () => void
}

const Container = styled('button', {
  cursor: 'pointer',
  width: 200,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  height: 194,
  outline: 'none',
  border: '1px solid $gray7',
  boxShadow: '$shadow100',
  padding: '$space100',
  borderRadius: '$radius200',
  transition: 'all 0.2s ease-in-out',
  '&:hover, &:focus': {
    backgroundColor: '$gray2',
    boxShadow: '$shadow200',
  },
})

const Card: FC<CardProps> = ({ title, id, onAction }) => {
  return (
    <Container onClick={onAction}>
      <Stack direction="column" spacing="$space80">
        <Stack direction="column" spacing="$space60">
          <Avatar name={id} variation="marble" size={20} />
          <Heading renderAs="h2" size="$size100">
            {title}
          </Heading>
        </Stack>
      </Stack>
    </Container>
  )
}

export const SelectWorkspace: FC = () => {
  const { accounts } = useCurrentUser()
  const { updateCurrentAccount } = useLooseCurrentWorkspace()

  return (
    <Box paddingX="$space200" paddingY="$space600">
      <Box width="100%" maxWidth={680} margin="0 auto">
        <Stack
          width="100%"
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing="$space300"
        >
          <Stack direction="column" alignItems="center" spacing="$space60">
            <Text size="$size80" color="$gray14">
              Welcome back
            </Text>

            <Stack direction="column" spacing="$space100">
              <Heading
                textAlign="center"
                renderAs="h1"
                size="$size400"
                lineHeight="$lineHeight100"
                maxWidth={400}
              >
                Choose workspace
              </Heading>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing="$space100"
            renderAs="ul"
          >
            {accounts.map(account => (
              <Box renderAs="li" key={account.workspace.id}>
                <Card
                  id={account.workspace.key}
                  title={account.workspace.name}
                  onAction={() => updateCurrentAccount(account)}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
