import {
  FC,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import {
  Banner,
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  Switch,
  TextField,
  toast,
} from '../../../../components/primitives'
import { Components } from '../../../../generated/typeDefinitions'
import {
  getListDestinationsQueryKey,
  useCreateCDNDestination,
} from '../../../../generated/reactQuery'
import { fileFormatLabels } from '../../../../utils/files'
import { useQueryClient } from '@tanstack/react-query'

export interface CreateDestinationModalRef {
  open: (project: Components.Schemas.Project) => void
  close: () => void
}

interface ContentProps {
  project: Components.Schemas.Project
  close: () => void
}

interface State {
  name: string
  revisionId: string
  type: 'cdn'
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
}

// const Permission = styled('span', {
//   display: 'inline-block',
//   fontFamily: '$mono',
//   fontSize: '$size60',
//   borderRadius: '$radius200',
//   paddingX: '$space40',
//   paddingY: '$space20',
//   backgroundColor: '$gray5',
// })

const isValid = (state: State): boolean => {
  switch (state.type) {
    case 'cdn':
      return state.name.length > 0 && !!state.revisionId
  }
}

const Content: FC<ContentProps> = ({ project, close }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: createCDN, isPending: isCreatingCDN } =
    useCreateCDNDestination({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListDestinationsQueryKey({
            queryParams: { projectId: project.id },
          }),
        })
      },
    })
  const [state, setState] = useState<State>({
    name: '',
    type: 'cdn',
    fileFormat: 'json',
    revisionId: project.masterRevisionId,
    includeEmptyTranslations: false,
  })

  const onSubmit = () => {
    if (isCreatingCDN) {
      return
    }

    switch (state.type) {
      case 'cdn':
        createCDN({
          body: {
            revisionId: state.revisionId!,
            fileFormat: state.fileFormat,
            includeEmptyTranslations: state.includeEmptyTranslations,
            name: state.name,
          },
        })
          .then(() => {
            close()
            toast('success', {
              title: 'Destination created',
            })
          })
          .catch(() => {
            toast('error', {
              title: 'Could not create destination',
            })
          })
        break
    }
  }

  const isStateValid = isValid(state)

  return (
    <ModalContent
      asForm
      contextTitle={project?.name}
      title="Create destination"
      primaryAction={{
        label: 'Save destination',
        isLoading: isCreatingCDN,
        onAction: onSubmit,
        isDisabled: !isStateValid,
      }}
    >
      <Stack direction="column" spacing="$space200" paddingBottom="$space300">
        {state.type === 'cdn' && (
          <Banner
            variation="info"
            title="Recontent built-in CDN"
            description="Our CDN is built on top of AWS Cloudfront which guarantees low latency internationally & high availability. New destinations will be added in the upcoming months."
          />
        )}

        {/* <SelectField
          label="Type"
          options={destinationTypes.map(destinationType => ({
            label: destinationTypeLabels[destinationType],
            value: destinationType,
          }))}
          value={state.type}
          onChange={option => {
            if (!option) {
              return
            }

            setState(state => ({
              ...state,
              type: option.value as DestinationType,
            }))
          }}
        /> */}

        <TextField
          autoFocus
          label="Name"
          value={state.name}
          placeholder="Master CDN"
          onChange={name =>
            setState(state => ({
              ...state,
              name,
            }))
          }
        />

        <Stack direction="column" spacing="$space80">
          <SelectField
            label="File format"
            options={Object.entries(fileFormatLabels).map(([value, label]) => ({
              label,
              value,
            }))}
            value={state.fileFormat}
            onChange={option => {
              if (!option) {
                return
              }

              setState(state => ({
                ...state,
                fileFormat: option.value as Components.Schemas.FileFormat,
              }))
            }}
          />

          <Switch
            label="Include phrases with empty translations?"
            value={state.includeEmptyTranslations}
            onChange={includeEmptyTranslations => {
              setState(state => ({
                ...state,
                includeEmptyTranslations,
              }))
            }}
          />
        </Stack>
      </Stack>
    </ModalContent>
  )
}

export const CreateDestinationModal = forwardRef<CreateDestinationModalRef>(
  (props, ref) => {
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
        {project && <Content project={project} close={close} />}
      </Modal>
    )
  },
)
