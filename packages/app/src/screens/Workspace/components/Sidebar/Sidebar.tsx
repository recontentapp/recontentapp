import { FC, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box, Stack } from 'design-system'
import { useListProjects } from '../../../../generated/reactQuery'
import { useSystem } from '../../../../hooks/system'
import { useCurrentWorkspace, useHasAbility } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { styled } from '../../../../theme'
import { useModals } from '../../hooks/modals'
import {
  ActionButton,
  ActionButtonProps,
  ActionsList,
} from './components/ActionsList'
import { Button } from './components/Button'
import { FeedbacksModal, FeedbacksModalRef } from './components/FeedbacksModal'
import { ProjectsList } from './components/ProjectsList'
import { WorkspaceDropdown } from './components/WorkspaceDropdown'

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
  const {
    version,
    settings: { feedbacksAvailable },
  } = useSystem()
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
  const canManageLanguages = useHasAbility('languages:manage')
  const canManageMembers = useHasAbility('members:manage')
  const canManageIntegrations = useHasAbility('integrations:manage')
  const feedbacksModalRef = useRef<FeedbacksModalRef>(null!)

  const canAdmin =
    canManageMembers || canManageLanguages || canManageIntegrations

  const actionsList = useMemo(() => {
    const list: ActionButtonProps[] = []

    if (canAdmin) {
      list.push({
        name: 'Settings & Members',
        icon: 'settings',
        onAction: () =>
          navigate(
            routes.workspaceSettingsMembers.url({
              pathParams: { workspaceKey },
            }),
          ),
      })
    }

    return list
  }, [canAdmin, navigate, workspaceKey])

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
            data?.items.map(({ name, id, masterRevisionId }) => ({
              name,
              id,
              revisionId: masterRevisionId,
            })) ?? []
          }
        />
      </Scroller>

      <FeedbacksModal ref={feedbacksModalRef} />

      <Bottom>
        <Box paddingX="$space60">
          <Stack width="100%" direction="column" spacing="$space200">
            <Stack direction="column" spacing="$space0">
              {feedbacksAvailable && (
                <ActionButton
                  onAction={() => feedbacksModalRef.current.open()}
                  name="Send feedback"
                  icon="reviews"
                />
              )}
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

              <VersionLabel>v{version}</VersionLabel>
            </Stack>
          </Stack>
        </Box>
      </Bottom>
    </Container>
  )
}
