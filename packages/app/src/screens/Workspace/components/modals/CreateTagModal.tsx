import {
  FC,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import {
  Button,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  Tag,
  Text,
  TextField,
  toast,
} from 'design-system'
import { Components } from '../../../../generated/typeDefinitions'
import {
  getGetReferenceableTagsQueryKey,
  getListProjectTagsQueryKey,
  useCreateProjectTag,
  useGetProject,
} from '../../../../generated/reactQuery'
import { getRandomHexColor } from '../../../../utils/colors'
import { useQueryClient } from '@tanstack/react-query'

export interface CreateTagModalRef {
  open: (project: Components.Schemas.Project) => void
  close: () => void
}

interface ContentProps {
  projectId: string
  close: () => void
}

interface State {
  key: string
  value: string
  description: string
  color: string
}

const Content: FC<ContentProps> = ({ projectId, close }) => {
  const queryClient = useQueryClient()
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { mutateAsync, isPending } = useCreateProjectTag({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListProjectTagsQueryKey({ queryParams: { projectId } }),
      })
      queryClient.invalidateQueries({
        queryKey: getGetReferenceableTagsQueryKey({
          queryParams: { projectId },
        }),
      })
    },
  })
  const [state, setState] = useState<State>({
    key: '',
    value: '',
    description: '',
    color: getRandomHexColor(),
  })

  const onSubmit = () => {
    if (isPending) {
      return
    }

    mutateAsync({
      body: {
        projectId,
        key: state.key,
        value: state.value,
        color: state.color,
        description: state.description.length > 0 ? state.description : null,
      },
    })
      .then(() => {
        close()
        toast('success', {
          title: 'Tag created',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not create tag',
        })
      })
  }

  const canBeSubmitted = state.key.length > 0 && state.value.length > 0

  return (
    <ModalContent
      asForm
      contextTitle={project?.name}
      title="Create tag"
      primaryAction={{
        label: 'Save tag',
        isLoading: isPending,
        onAction: onSubmit,
        isDisabled: !canBeSubmitted,
      }}
    >
      <Stack direction="column" spacing="$space100" paddingBottom="$space300">
        <TextField
          autoFocus
          label="Key"
          value={state.key}
          placeholder="French"
          info="Use tags with the same key and different values for processes"
          onChange={key => {
            setState(state => ({
              ...state,
              key,
            }))
          }}
        />

        <TextField
          label="Value"
          value={state.value}
          placeholder="NeedsReview"
          onChange={value => {
            setState(state => ({
              ...state,
              value,
            }))
          }}
        />

        <Stack direction="column" spacing="$space60">
          <Text size="$size100" variation="bold" color="$gray14">
            Color
          </Text>

          <Stack direction="row" spacing="$space100" alignItems="center">
            <Stack direction="row" spacing="$space60" alignItems="center">
              <TextField
                hideLabel
                label="Color"
                value={state.color}
                placeholder="#ff0000"
                onChange={color => {
                  setState(state => ({
                    ...state,
                    color,
                  }))
                }}
              />

              <Tag
                size="small"
                label={`${state.key || 'key'}:${state.value || 'value'}`}
                color={state.color}
              />
            </Stack>

            <Button
              variation="secondary"
              onAction={() =>
                setState(state => ({
                  ...state,
                  color: getRandomHexColor(),
                }))
              }
            >
              Generate
            </Button>
          </Stack>
        </Stack>

        <TextField
          label="Description"
          isOptional
          value={state.description}
          placeholder="Indicates when a French translation needs to be reviewed"
          onChange={description => {
            setState(state => ({
              ...state,
              description,
            }))
          }}
        />
      </Stack>
    </ModalContent>
  )
}

export const CreateTagModal = forwardRef<CreateTagModalRef>((_props, ref) => {
  const [project, setProject] = useState<Components.Schemas.Project | null>(
    null,
  )
  const modalRef = useRef<ModalRef>(null!)

  useImperativeHandle(ref, () => ({
    open: project => {
      setProject(project)
      modalRef.current.open()
    },
    close: () => {
      modalRef.current.close()
    },
  }))

  const close = useCallback(() => {
    modalRef.current.close()
  }, [])

  return (
    <Modal ref={modalRef}>
      {project && <Content projectId={project.id} close={close} />}
    </Modal>
  )
})
