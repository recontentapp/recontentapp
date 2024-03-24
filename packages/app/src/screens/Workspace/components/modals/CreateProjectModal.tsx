import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Box,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  toast,
} from '../../../../components/primitives'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import { styled } from '../../../../theme'
import { toDashboard } from '../../routes'
import {
  getListProjectsQueryKey,
  useCreateProject,
  useListWorkspaceLanguages,
} from '../../../../generated/reactQuery'
import { useQueryClient } from '@tanstack/react-query'

export interface CreateProjectModalRef {
  open: () => void
  close: () => void
}

interface State {
  name: string
  description: string
}

const DEFAULT_STATE: State = {
  name: '',
  description: '',
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

export const CreateProjectModal = forwardRef<CreateProjectModalRef>(
  (_props, ref) => {
    const queryClient = useQueryClient()
    const [addAllLanguages, setAddAllLanguages] = useState(false)
    const navigate = useNavigate()
    const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
    const { data: languages = [] } = useListWorkspaceLanguages({
      queryParams: { workspaceId },
    })
    const modalRef = useRef<ModalRef>(null!)
    const inputRef = useRef<HTMLInputElement>(null!)
    const { mutateAsync: createProject, isPending: isCreatingProject } =
      useCreateProject()
    const [state, setState] = useState<State>(DEFAULT_STATE)

    useImperativeHandle(ref, () => ({
      open: () => {
        setState(DEFAULT_STATE)
        modalRef.current.open()

        requestAnimationFrame(() => inputRef.current?.focus())
      },
      close: () => {
        modalRef.current.close()
      },
    }))

    const canBeSubmitted = state.name.length > 0

    const onSubmit = () => {
      if (isCreatingProject) {
        return
      }

      createProject({
        body: {
          name: state.name,
          description: state.description,
          languageIds: addAllLanguages ? languages.map(l => l.id) : [],
          workspaceId,
        },
      })
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: getListProjectsQueryKey(),
          })
          toast('success', {
            title: 'Project created',
            description: 'You can start adding phrases to it',
          })
          modalRef.current.close()
          navigate(toDashboard(workspaceKey))
        })
        .catch(() => {
          toast('error', {
            title: 'Could not create project',
          })
        })
    }

    return (
      <Modal ref={modalRef}>
        <ModalContent
          asForm
          title="Create project"
          primaryAction={{
            label: 'Create project',
            onAction: onSubmit,
            isDisabled: !canBeSubmitted,
            isLoading: isCreatingProject,
          }}
          footer={{
            toggleLabel: 'Add all workspace languages',
            isToggled: addAllLanguages,
            onToggle: value => setAddAllLanguages(value),
          }}
        >
          <Box paddingBottom="$space200" minHeight={122}>
            <Stack direction="column" spacing="$space80" width="100%">
              <Stack direction="column" spacing="$space80" width="100%">
                <Input
                  type="text"
                  autoFocus
                  ref={inputRef}
                  placeholder="Project name"
                  value={state.name}
                  onChange={event =>
                    setState(state => ({
                      ...state,
                      name: event.target.value,
                    }))
                  }
                />

                <Input
                  type="text"
                  placeholder="Project description"
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
      </Modal>
    )
  },
)
