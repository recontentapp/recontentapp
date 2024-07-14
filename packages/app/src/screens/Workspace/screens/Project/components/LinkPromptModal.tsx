import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  toast,
} from 'design-system'
import {
  getListPromptsQueryKey,
  useLinkPromptWithProject,
  useListPrompts,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

export interface LinkPromptModalRef {
  open: (projectId: string) => void
  close: () => void
}

interface ContentProps {
  projectId: string
  onRequestClose: () => void
}

const Content: FC<ContentProps> = ({ projectId, onRequestClose }) => {
  const queryClient = useQueryClient()
  const { id: workspaceId } = useCurrentWorkspace()
  const [promptId, setPromptId] = useState<string | null>(null)
  const { mutateAsync, isPending: isLinking } = useLinkPromptWithProject({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListPromptsQueryKey({
          queryParams: {
            workspaceId,
            projectId,
          },
        }),
      })
    },
  })
  const { data } = useListPrompts({
    queryParams: {
      workspaceId,
    },
  })

  const canBeSubmitted = !!promptId

  const onSubmit = () => {
    if (!promptId) {
      return
    }

    mutateAsync({
      body: {
        projectId,
        promptId,
      },
    })
      .then(() => {
        toast('success', {
          title: 'Prompt successfully linked',
        })

        onRequestClose()
      })
      .catch(() => {
        toast('error', {
          title: 'Could not link prompt',
        })
      })
  }

  return (
    <ModalContent
      asForm
      title="Link prompt to project"
      primaryAction={{
        label: 'Link prompt',
        onAction: onSubmit,
        isDisabled: !canBeSubmitted,
        isLoading: isLinking,
      }}
    >
      <Box width="100%" paddingBottom="$space200" minHeight={122}>
        <Stack width="100%" direction="column" spacing="$space100">
          <SelectField
            label="Prompt"
            options={
              data?.items.map(prompt => ({
                label: prompt.name,
                value: prompt.id,
              })) ?? []
            }
            placeholder="Choose a prompt"
            value={promptId ?? undefined}
            onChange={option => {
              if (!option) {
                return
              }
              setPromptId(option.value)
            }}
          />
        </Stack>
      </Box>
    </ModalContent>
  )
}

export const LinkPromptModal = forwardRef<LinkPromptModalRef>((_props, ref) => {
  const [projectId, setProjectId] = useState<string | null>(null)
  const modalRef = useRef<ModalRef>(null!)

  useImperativeHandle(ref, () => ({
    open: projectId => {
      setProjectId(projectId)
      modalRef.current.open()
    },
    close: () => {
      modalRef.current.close()
    },
  }))

  return (
    <Modal ref={modalRef}>
      {projectId && (
        <Content
          projectId={projectId}
          onRequestClose={() => {
            modalRef.current.close()
          }}
        />
      )}
    </Modal>
  )
})
