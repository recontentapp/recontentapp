import { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Box, Modal, ModalContent, ModalRef, Stack, toast } from 'design-system'
import { useNavigate } from 'react-router-dom'
import {
  getListEmailLayoutsQueryKey,
  useCreateEmailLayout,
} from '../../../../generated/reactQuery'
import { Components } from '../../../../generated/typeDefinitions'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { styled } from '../../../../theme'

export interface CreateEmailLayoutModalRef {
  open: (project: Components.Schemas.Project) => void
  close: () => void
}

const Input = styled('input', {
  display: 'block',
  width: '100%',
  fontSize: '$size200',
  border: 'none',
  outline: 'none',
  padding: 0,
  color: '$gray14',
  background: 'transparent',
  fontWeight: 500,
})

interface ContentProps {
  project: Components.Schemas.Project
  onRequestClose: () => void
}

interface State {
  key: string
  description: string
}

const DEFAULT_STATE: State = {
  key: '',
  description: '',
}

const Content: FC<ContentProps> = ({ project, onRequestClose }) => {
  const { mutateAsync: createEmailLayout, isPending: isCreatingEmailLayout } =
    useCreateEmailLayout()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null!)
  const [state, setState] = useState<State>(DEFAULT_STATE)
  const { key: workspaceKey } = useCurrentWorkspace()
  const canBeSubmitted = state.key.length > 0

  const onSubmit = () => {
    if (isCreatingEmailLayout) {
      return
    }

    createEmailLayout({
      body: {
        key: state.key,
        description: state.description,
        projectId: project.id,
        content: '',
        variables: [],
      },
    })
      .then(() => {
        toast('success', {
          title: 'Email layout created',
          description: 'You can start adding content to it',
        })
        onRequestClose()
        navigate(
          routes.projectEmailLayouts.url({
            pathParams: { workspaceKey, projectId: project.id },
          }),
        )
      })
      .catch(() => {
        toast('error', {
          title: 'Could not create email layout',
        })
      })
  }

  return (
    <ModalContent
      asForm
      contextTitle={project.name}
      title="Create email layout"
      primaryAction={{
        label: 'Save email layout',
        onAction: onSubmit,
        isDisabled: !canBeSubmitted,
        isLoading: isCreatingEmailLayout,
      }}
    >
      <Box paddingBottom="$space200" minHeight={122}>
        <Stack direction="column" spacing="$space80" width="100%">
          <Stack direction="column" spacing="$space80" width="100%">
            <Input
              type="text"
              autoFocus
              ref={inputRef}
              placeholder="Layout key"
              value={state.key}
              onChange={event =>
                setState(state => ({
                  ...state,
                  key: event.target.value,
                }))
              }
            />

            <Input
              type="text"
              placeholder="Layout description"
              css={{ fontSize: '$size80' }}
              value={state.description}
              onChange={event =>
                setState(state => ({
                  ...state,
                  description: event.target.value,
                }))
              }
            />
          </Stack>
        </Stack>
      </Box>
    </ModalContent>
  )
}

export const CreateEmailLayoutModal = forwardRef<CreateEmailLayoutModalRef>(
  (_props, ref) => {
    const queryClient = useQueryClient()
    const [project, setProject] = useState<Components.Schemas.Project | null>(
      null,
    )
    const modalRef = useRef<ModalRef>(null!)

    const onClose = () => {
      modalRef.current.close()

      if (!project) {
        return
      }
      queryClient.invalidateQueries({
        queryKey: getListEmailLayoutsQueryKey({
          queryParams: { projectId: project.id },
        }),
      })
    }

    useImperativeHandle(ref, () => ({
      open: project => {
        setProject(project)
        modalRef.current.open()
      },
      close: onClose,
    }))

    return (
      <Modal ref={modalRef} onClose={onClose}>
        {project && <Content project={project} onRequestClose={onClose} />}
      </Modal>
    )
  },
)
