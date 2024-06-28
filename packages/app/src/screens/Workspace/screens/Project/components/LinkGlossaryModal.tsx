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
  getListGlossariesQueryKey,
  useLinkGlossaryWithProject,
  useListGlossaries,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'

export interface LinkGlossaryModalRef {
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
  const [glossaryId, setGlossaryId] = useState<string | null>(null)
  const { mutateAsync, isPending: isLinking } = useLinkGlossaryWithProject({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListGlossariesQueryKey({
          queryParams: {
            workspaceId,
            projectId,
          },
        }),
      })
    },
  })
  const { data } = useListGlossaries({
    queryParams: {
      workspaceId,
    },
  })

  const canBeSubmitted = !!glossaryId

  const onSubmit = () => {
    if (!glossaryId) {
      return
    }

    mutateAsync({
      body: {
        projectId,
        glossaryId,
      },
    })
      .then(() => {
        toast('success', {
          title: 'Glossary successfully linked',
        })

        onRequestClose()
      })
      .catch(() => {
        toast('error', {
          title: 'Could not link glossary',
        })
      })
  }

  return (
    <ModalContent
      asForm
      title="Link glossary to project"
      primaryAction={{
        label: 'Link glossary',
        onAction: onSubmit,
        isDisabled: !canBeSubmitted,
        isLoading: isLinking,
      }}
    >
      <Box width="100%" paddingBottom="$space200" minHeight={122}>
        <Stack width="100%" direction="column" spacing="$space100">
          <SelectField
            label="Glossary"
            options={
              data?.items.map(glossary => ({
                label: glossary.name,
                value: glossary.id,
              })) ?? []
            }
            placeholder="Choose a glossary"
            value={glossaryId ?? undefined}
            onChange={option => {
              if (!option) {
                return
              }
              setGlossaryId(option.value)
            }}
          />
        </Stack>
      </Box>
    </ModalContent>
  )
}

export const LinkGlossaryModal = forwardRef<LinkGlossaryModalRef>(
  (_props, ref) => {
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
  },
)
