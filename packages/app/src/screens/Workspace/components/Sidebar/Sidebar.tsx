import { FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box, Stack } from '../../../../components/primitives'
import { styled } from '../../../../theme'
import { useModals } from '../../hooks/modals'
import { toWorkspaceSettingsMembers } from '../../routes'
import {
  ActionButton,
  ActionButtonProps,
  ActionsList,
} from './components/ActionsList'
import { Button } from './components/Button'
import { ProjectsList } from './components/ProjectsList'
import { WorkspaceDropdown } from './components/WorkspaceDropdown'
import { useListProjects } from '../../../../generated/reactQuery'
import {
  useCurrentAccount,
  useCurrentWorkspace,
} from '../../../../hooks/workspace'

const Container = styled('aside', {
  display: 'flex',
  flexDirection: 'column',
  width: '240px',
  flexGrow: 0,
  flexShrink: 0,
  height: '100%',
  backgroundColor: '$purple900',
})

const Top = styled('div', {
  paddingX: '$space100',
  paddingY: '$space100',
  borderBottom: '1px solid $purple800',
})

const Scroller = styled('div', {
  paddingX: '$space100',
  paddingTop: '$space200',
  paddingBottom: '$space200',
  overflowY: 'auto',
  flex: 1,
})

const Bottom = styled('div', {
  paddingX: '$space100',
  paddingY: '$space200',
  borderTop: '1px solid $purple800',
})

const VersionLabel = styled('span', {
  color: '$purple600',
  fontSize: '$size60',
  textTransform: 'uppercase',
})

const LegalLink = styled('a', {
  color: '$purple600',
  fontSize: '$size60',
  transition: 'color 0.2s ease-in-out',
  '&:hover, &:focus, &:active': {
    color: '$purple500',
  },
})

export const Sidebar: FC = () => {
  const { openCreateProject } = useModals()
  const navigate = useNavigate()
  const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
  const { data } = useListProjects({
    queryParams: {
      workspaceId,
      page: 1,
      pageSize: 50,
    },
  })
  const account = useCurrentAccount()

  const actionsList = useMemo(() => {
    const list: ActionButtonProps[] = []

    if (account.canAdmin()) {
      list.push({
        name: 'Settings & Members',
        icon: 'settings',
        onAction: () => navigate(toWorkspaceSettingsMembers(workspaceKey)),
      })
    }

    return list
  }, [account, navigate, workspaceKey])

  return (
    <Container>
      <Top>
        <Stack direction="column" spacing="$space200">
          <WorkspaceDropdown />

          <Stack direction="column" spacing="$space80">
            <Button />

            <ActionsList items={actionsList} />
          </Stack>
        </Stack>
      </Top>

      <Scroller>
        <ProjectsList
          title="Projects"
          onAdd={() => openCreateProject()}
          items={
            data?.items.map(({ name, id }) => ({
              name,
              id,
            })) ?? []
          }
        />
      </Scroller>

      <Bottom>
        <Box paddingX="$space60">
          <Stack width="100%" direction="column" spacing="$space200">
            <Stack direction="column" spacing="$space0">
              <ActionButton
                onAction={() => {}}
                name="Contact us"
                icon="question_answer"
              />
            </Stack>

            <Stack
              direction="row"
              spacing="$space80"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing="$space80">
                <LegalLink href="https://recontent.app/terms" target="_blank">
                  Terms of use
                </LegalLink>
                <LegalLink href="https://recontent.app/privacy" target="_blank">
                  Privacy
                </LegalLink>
              </Stack>

              <VersionLabel>v0.1.0</VersionLabel>
            </Stack>
          </Stack>
        </Box>
      </Bottom>
    </Container>
  )
}
