import { useQueryClient } from '@tanstack/react-query'
import {
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  Heading,
  Stack,
} from 'design-system'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListPrompts } from '../../../../../generated/reactQuery'
import {
  useCurrentWorkspace,
  useHasAbility,
} from '../../../../../hooks/workspace'
import { LinkPromptModal, LinkPromptModalRef } from './LinkPromptModal'
import { PromptCard } from './PromptCard'

interface Props {
  projectId: string
}

export const ProjectPrompts = ({ projectId }: Props) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id: workspaceId } = useCurrentWorkspace()
  const linkPromptModalRef = useRef<LinkPromptModalRef>(null!)
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const canManagePrompts = useHasAbility('prompts:manage')
  const { data } = useListPrompts({
    queryParams: {
      workspaceId,
      projectId,
    },
  })

  return (
    <Stack direction="column" spacing="$space80">
      <Stack direction="row" alignItems="center" spacing="$space60">
        <Heading size="$size100" color="$gray14" renderAs="h2">
          AI prompts
        </Heading>

        <Stack direction="row" alignItems="center" spacing="$space60">
          {canManagePrompts && (
            <Button
              variation="secondary"
              icon="add"
              size="xsmall"
              onAction={() => linkPromptModalRef.current.open(projectId)}
            >
              Add
            </Button>
          )}
        </Stack>
      </Stack>

      {(data?.items ?? []).length > 0 && (
        <Stack direction="row" flexWrap="wrap" spacing="$space40">
          {data?.items.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </Stack>
      )}

      <LinkPromptModal ref={linkPromptModalRef} />

      <ConfirmationModal
        ref={confirmationModalRef}
        variation="danger"
        title="Are you sure about unlinking this glossary?"
        description="You can always link it again in the future."
      />
    </Stack>
  )
}
