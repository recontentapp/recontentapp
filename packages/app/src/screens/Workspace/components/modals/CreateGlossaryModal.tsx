import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQueryClient } from '@tanstack/react-query'
import { Box, Modal, ModalContent, ModalRef, Stack, toast } from 'design-system'
import {
  getListGlossariesQueryKey,
  useCreateGlossary,
} from '../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { styled } from '../../../../theme'

export interface CreateGlossaryModalRef {
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

export const CreateGlossaryModal = forwardRef<CreateGlossaryModalRef>(
  (_props, ref) => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
    const modalRef = useRef<ModalRef>(null!)
    const inputRef = useRef<HTMLInputElement>(null!)
    const { mutateAsync: createGlossary, isPending: isCreatingGlossary } =
      useCreateGlossary({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListGlossariesQueryKey(),
          })
        },
      })
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
      if (isCreatingGlossary) {
        return
      }

      createGlossary({
        body: {
          name: state.name,
          description: state.description,
          workspaceId,
        },
      })
        .then(() => {
          toast('success', {
            title: 'Glossary created',
            description: 'You can start adding terms to it',
          })
          modalRef.current.close()
          navigate(
            routes.workspaceSettingsGlossaries.url({
              pathParams: { workspaceKey },
            }),
          )
        })
        .catch(() => {
          toast('error', {
            title: 'Could not create glossary',
          })
        })
    }

    return (
      <Modal ref={modalRef}>
        <ModalContent
          asForm
          title="Create glossary"
          primaryAction={{
            label: 'Create glossary',
            onAction: onSubmit,
            isDisabled: !canBeSubmitted,
            isLoading: isCreatingGlossary,
          }}
        >
          <Box paddingBottom="$space200" minHeight={122}>
            <Stack direction="column" spacing="$space80" width="100%">
              <Stack direction="column" spacing="$space80" width="100%">
                <Input
                  type="text"
                  autoFocus
                  ref={inputRef}
                  placeholder="Glossary name"
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
                  placeholder="Glossary description"
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
