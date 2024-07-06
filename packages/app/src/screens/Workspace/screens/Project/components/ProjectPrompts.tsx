import {
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  Heading,
  Stack,
} from 'design-system'
import { useRef } from 'react'
import { useListPrompts } from '../../../../../generated/reactQuery'
import {
  useCurrentWorkspace,
  useHasAbility,
} from '../../../../../hooks/workspace'
import { LinkPromptModal, LinkPromptModalRef } from './LinkPromptModal'
import { PromptCard } from './PromptCard'
import { ShowPromptModal, ShowPromptModalRef } from './ShowPromptModal'

interface Props {
  projectId: string
}

export const ProjectPrompts = ({ projectId }: Props) => {
  const { id: workspaceId } = useCurrentWorkspace()
  const linkPromptModalRef = useRef<LinkPromptModalRef>(null!)
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const showPromptModalRef = useRef<ShowPromptModalRef>(null!)
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
              icon="link"
              size="xsmall"
              onAction={() => linkPromptModalRef.current.open(projectId)}
            >
              Link to project
            </Button>
          )}
        </Stack>
      </Stack>

      {(data?.items ?? []).length > 0 && (
        <Stack direction="row" flexWrap="wrap" spacing="$space40">
          {data?.items.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onAction={() => showPromptModalRef.current.open(prompt)}
            />
          ))}
        </Stack>
      )}

      <LinkPromptModal ref={linkPromptModalRef} />

      <ShowPromptModal ref={showPromptModalRef} />

      <ConfirmationModal
        ref={confirmationModalRef}
        variation="danger"
        title="Are you sure about unlinking this glossary?"
        description="You can always link it again in the future."
      />
    </Stack>
  )
}
