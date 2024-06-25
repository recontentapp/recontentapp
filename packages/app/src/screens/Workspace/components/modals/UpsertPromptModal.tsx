import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  IconButton,
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  Text,
  TextField,
  toast,
} from 'design-system'
import {
  getListPromptsQueryKey,
  useCreatePrompt,
  useUpdatePrompt,
} from '../../../../generated/reactQuery'
import { Components } from '../../../../generated/typeDefinitions'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import {
  promptLengthOptions,
  promptToneOptions,
} from '../../../../utils/prompts'

export interface UpsertPromptModalRef {
  open: (prompt: Components.Schemas.Prompt | null) => void
  close: () => void
}

interface ContentProps {
  prompt: Components.Schemas.Prompt | null
  onRequestClose: () => void
}

interface State {
  id: string | null
  glossaryId: string | null
  name: string
  description: string | null
  tone: Components.Schemas.PromptTone | null
  length: Components.Schemas.PromptLength | null
  customInstructions: string[]
}

const DEFAULT_STATE: State = {
  id: null,
  glossaryId: null,
  name: '',
  description: null,
  tone: null,
  length: null,
  customInstructions: [],
}

const Content: FC<ContentProps> = ({ prompt, onRequestClose }) => {
  const { id: workspaceId } = useCurrentWorkspace()
  const { mutateAsync: createPrompt, isPending: isCreatingPrompt } =
    useCreatePrompt()
  const { mutateAsync: updatePrompt, isPending: isUpdatingPrompt } =
    useUpdatePrompt()
  const [state, setState] = useState<State>(DEFAULT_STATE)

  useEffect(() => {
    if (!prompt) {
      setState(DEFAULT_STATE)
      return
    }

    setState({
      id: prompt.id,
      glossaryId: prompt.glossaryId,
      name: prompt.name,
      description: prompt.description,
      tone: prompt.tone,
      length: prompt.length,
      customInstructions: prompt.customInstructions,
    })
  }, [prompt])

  const canBeSubmitted =
    state.name.length > 0 &&
    ((state.tone && state.length) || state.customInstructions.length > 0)

  const onSubmit = () => {
    if (state.id) {
      updatePrompt({
        body: {
          id: state.id,
          glossaryId: state.glossaryId,
          name: state.name,
          description: state.description,
          tone: state.tone,
          length: state.length,
          customInstructions: state.customInstructions,
        },
      })
        .then(() => {
          onRequestClose()
        })
        .catch(() => {
          toast('error', {
            title: 'Could not update AI prompt',
          })
        })
      return
    }

    createPrompt({
      body: {
        workspaceId,
        glossaryId: state.glossaryId,
        name: state.name,
        description: state.description,
        tone: state.tone,
        length: state.length,
        customInstructions: state.customInstructions,
      },
    })
      .then(() => {
        toast('success', {
          title: 'AI prompt created',
          description: 'You can now use it in your projects',
        })

        onRequestClose()
      })
      .catch(() => {
        toast('error', {
          title: 'Could not create AI prompt',
        })
      })
  }

  return (
    <ModalContent
      asForm
      contextTitle={prompt?.name ?? undefined}
      title={prompt ? 'Edit AI prompt' : 'Create AI prompt'}
      primaryAction={{
        label: 'Save prompt',
        onAction: onSubmit,
        isDisabled: !canBeSubmitted,
        isLoading: isCreatingPrompt || isUpdatingPrompt,
      }}
    >
      <Box width="100%" paddingBottom="$space200" minHeight={122}>
        <Stack width="100%" direction="column" spacing="$space100">
          <TextField
            autoFocus
            label="Name"
            value={state.name}
            placeholder="My AI prompt"
            onChange={name =>
              setState(state => ({
                ...state,
                name,
              }))
            }
          />

          <TextField
            autoFocus
            label="Description"
            isOptional
            value={state.description ?? ''}
            placeholder=""
            onChange={description =>
              setState(state => ({
                ...state,
                description,
              }))
            }
          />

          <SelectField
            label="Tone"
            options={promptToneOptions}
            isOptional
            placeholder="Choose a tone"
            value={state.tone ?? undefined}
            onChange={option => {
              setState(state => ({
                ...state,
                tone:
                  (option?.value as
                    | Components.Schemas.PromptTone
                    | undefined) ?? null,
              }))
            }}
          />

          <SelectField
            label="Length"
            placeholder="Choose a length"
            isOptional
            options={promptLengthOptions}
            value={state.length ?? undefined}
            onChange={option => {
              setState(state => ({
                ...state,
                length:
                  (option?.value as
                    | Components.Schemas.PromptLength
                    | undefined) ?? null,
              }))
            }}
          />

          <Stack direction="column" spacing="$space60">
            <Text size="$size100" variation="bold" color="$gray14">
              Custom instructions
            </Text>

            {state.customInstructions.map((instruction, index) => (
              <Stack direction="row" spacing="$space60" alignItems="center">
                <Box flexGrow={1}>
                  <TextField
                    label="Custom instruction"
                    width="100%"
                    hideLabel
                    key={index}
                    value={instruction}
                    onChange={value => {
                      setState(prevState => {
                        const customInstructions = [
                          ...prevState.customInstructions,
                        ]
                        customInstructions[index] = value
                        return {
                          ...prevState,
                          customInstructions,
                        }
                      })
                    }}
                  />
                </Box>

                <IconButton
                  onAction={() => {
                    setState(prevState => {
                      const customInstructions = [
                        ...prevState.customInstructions,
                      ]
                      customInstructions.splice(index, 1)
                      return {
                        ...prevState,
                        customInstructions,
                      }
                    })
                  }}
                  src="delete"
                />
              </Stack>
            ))}

            <Box display="block">
              <Button
                variation="secondary"
                size="xsmall"
                icon="add"
                onAction={() =>
                  setState(prevState => ({
                    ...prevState,
                    customInstructions: [...prevState.customInstructions, ''],
                  }))
                }
              >
                Add instruction
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </ModalContent>
  )
}

export const UpsertPromptModal = forwardRef<UpsertPromptModalRef>(
  (_props, ref) => {
    const { id: workspaceId } = useCurrentWorkspace()
    const queryClient = useQueryClient()
    const [prompt, setPrompt] = useState<Components.Schemas.Prompt | null>(null)
    const modalRef = useRef<ModalRef>(null!)

    useImperativeHandle(ref, () => ({
      open: prompt => {
        setPrompt(prompt)
        modalRef.current.open()
      },
      close: () => {
        modalRef.current.close()
      },
    }))

    return (
      <Modal
        ref={modalRef}
        onClose={() => {
          queryClient.invalidateQueries({
            queryKey: getListPromptsQueryKey({
              queryParams: { workspaceId },
            }),
          })
        }}
      >
        <Content
          prompt={prompt}
          onRequestClose={() => {
            queryClient.invalidateQueries({
              queryKey: getListPromptsQueryKey({
                queryParams: { workspaceId },
              }),
            })
            modalRef.current.close()
          }}
        />
      </Modal>
    )
  },
)
