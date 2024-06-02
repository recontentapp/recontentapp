import {
  FC,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Banner,
  ExternalLink,
  Modal,
  ModalContent,
  ModalRef,
  SelectField,
  Stack,
  Switch,
  TextField,
  toast,
} from 'design-system'
import { Components } from '../../../../generated/typeDefinitions'
import {
  getListDestinationsQueryKey,
  useCreateAWSS3Destination,
  useCreateCDNDestination,
  useCreateGoogleCloudStorageDestination,
} from '../../../../generated/reactQuery'
import { fileFormatLabels } from '../../../../utils/files'
import { useQueryClient } from '@tanstack/react-query'
import { destinationTypeLabels } from '../../../../utils/destinations'
import { useSystem } from '../../../../hooks/system'
import { styled } from '../../../../theme'

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
  type: Components.Schemas.DestinationType
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
  ObjectsPrefix: string
  googleCloudStorageProjectId: string
  googleCloudStorageBucketId: string
  googleCloudStorageServiceAccountKey: string
  awsRegion: string
  awsBucketId: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
}

const Permission = styled('span', {
  display: 'inline-block',
  fontFamily: '$mono',
  fontSize: '$size60',
  borderRadius: '$radius200',
  paddingX: '$space40',
  paddingY: '$space20',
  backgroundColor: '$gray5',
})

const isValid = (state: State): boolean => {
  switch (state.type) {
    case 'cdn':
      return state.name.length > 0 && !!state.revisionId
    case 'aws_s3':
      return (
        state.name.length > 0 &&
        !!state.revisionId &&
        state.awsRegion.length > 0 &&
        state.awsBucketId.length > 0 &&
        state.awsAccessKeyId.length > 0 &&
        state.awsSecretAccessKey.length > 0
      )
    case 'google_cloud_storage':
      return (
        state.name.length > 0 &&
        !!state.revisionId &&
        state.googleCloudStorageBucketId.length > 0 &&
        state.googleCloudStorageProjectId.length > 0 &&
        state.googleCloudStorageServiceAccountKey.length > 0
      )
    case 'github':
      // TODO: Implement
      return true
  }
}

const Content: FC<ContentProps> = ({ project, close }) => {
  const queryClient = useQueryClient()
  const {
    settings: { cdnAvailable },
  } = useSystem()
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
  const { mutateAsync: createAWSS3, isPending: isCreatingAWSS3 } =
    useCreateAWSS3Destination({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListDestinationsQueryKey({
            queryParams: { projectId: project.id },
          }),
        })
      },
    })
  const {
    mutateAsync: createGoogleCloudStorage,
    isPending: isCreatingGoogleCloudStorage,
  } = useCreateGoogleCloudStorageDestination({
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
    type: cdnAvailable ? 'cdn' : 'aws_s3',
    fileFormat: 'json',
    revisionId: project.masterRevisionId,
    includeEmptyTranslations: false,
    ObjectsPrefix: '',
    googleCloudStorageProjectId: '',
    googleCloudStorageBucketId: '',
    googleCloudStorageServiceAccountKey: '',
    awsRegion: '',
    awsBucketId: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
  })

  const isCreating =
    isCreatingCDN || isCreatingGoogleCloudStorage || isCreatingAWSS3

  const onSubmit = () => {
    if (isCreating) {
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
      case 'aws_s3':
        createAWSS3({
          body: {
            revisionId: state.revisionId!,
            fileFormat: state.fileFormat,
            includeEmptyTranslations: state.includeEmptyTranslations,
            name: state.name,
            objectsPrefix:
              state.ObjectsPrefix.length > 0 ? state.ObjectsPrefix : undefined,
            awsRegion: state.awsRegion,
            awsBucketId: state.awsBucketId,
            awsAccessKeyId: state.awsAccessKeyId,
            awsSecretAccessKey: state.awsSecretAccessKey,
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
      case 'google_cloud_storage':
        createGoogleCloudStorage({
          body: {
            revisionId: state.revisionId!,
            fileFormat: state.fileFormat,
            includeEmptyTranslations: state.includeEmptyTranslations,
            name: state.name,
            objectsPrefix:
              state.ObjectsPrefix.length > 0 ? state.ObjectsPrefix : undefined,
            googleCloudBucketId: state.googleCloudStorageBucketId,
            googleCloudProjectId: state.googleCloudStorageProjectId,
            googleCloudServiceAccountKey:
              state.googleCloudStorageServiceAccountKey,
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

  const typeOptions = useMemo(() => {
    return Object.entries(destinationTypeLabels)
      .map(([value, label]) => ({
        label,
        value,
      }))
      .filter(item => {
        if (item.value === 'cdn') {
          return cdnAvailable
        }

        return true
      })
  }, [cdnAvailable])

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

        {state.type === 'google_cloud_storage' && (
          <Banner
            variation="info"
            title="Google Cloud Storage integration"
            description={
              <span>
                Export your phrases & translations to your own Google Cloud
                Storage bucket. Make sure to create a service account{' '}
                <ExternalLink
                  title="IAM roles for Cloud Storage"
                  fontSize="$size80"
                  icon={false}
                  href="https://cloud.google.com/storage/docs/access-control/iam-roles"
                >
                  with a role
                </ExternalLink>{' '}
                that has the <Permission>storage.objects.*</Permission>{' '}
                permissions on your bucket.
              </span>
            }
          />
        )}

        {state.type === 'aws_s3' && (
          <Banner
            variation="info"
            title="AWS S3 integration"
            description={
              <span>
                Export your phrases & translations to your own AWS S3 bucket.
                Make sure to create a{' '}
                <ExternalLink
                  title="IAM user"
                  fontSize="$size80"
                  icon={false}
                  href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html"
                >
                  IAM user
                </ExternalLink>{' '}
                that has{' '}
                <ExternalLink
                  fontSize="$size80"
                  icon={false}
                  title="all write/read permissions for objects"
                  href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-with-s3-actions.html#using-with-s3-actions-related-to-objects"
                >
                  all write/read permissions for objects
                </ExternalLink>{' '}
                in your bucket.
              </span>
            }
          />
        )}

        <SelectField
          label="Type"
          options={typeOptions}
          value={state.type}
          onChange={option => {
            if (!option) {
              return
            }

            setState(state => ({
              ...state,
              type: option.value as Components.Schemas.DestinationType,
            }))
          }}
        />

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

          {state.type === 'google_cloud_storage' && (
            <>
              <TextField
                label="GCP Project ID"
                value={state.googleCloudStorageProjectId}
                placeholder="my-project-1234"
                onChange={googleCloudStorageProjectId =>
                  setState(state => ({
                    ...state,
                    googleCloudStorageProjectId,
                  }))
                }
              />

              <TextField
                label="GCP Bucket ID"
                value={state.googleCloudStorageBucketId}
                placeholder="public-cdn"
                onChange={googleCloudStorageBucketId =>
                  setState(state => ({
                    ...state,
                    googleCloudStorageBucketId,
                  }))
                }
              />

              <TextField
                label="GCP Objects prefix"
                value={state.ObjectsPrefix}
                placeholder="translations/"
                onChange={ObjectsPrefix =>
                  setState(state => ({
                    ...state,
                    ObjectsPrefix,
                  }))
                }
                info="When empty, generated files will be stored as root objects in the bucket"
              />

              <TextField
                label="GCP Service account JSON key"
                value={state.googleCloudStorageServiceAccountKey}
                placeholder=""
                onChange={googleCloudStorageServiceAccountKey =>
                  setState(state => ({
                    ...state,
                    googleCloudStorageServiceAccountKey,
                  }))
                }
                info="Encrypted in our database, only used when syncing your destination"
              />
            </>
          )}

          {state.type === 'aws_s3' && (
            <>
              <TextField
                label="S3 Bucket ID"
                value={state.awsBucketId}
                placeholder="public-cdn"
                onChange={awsBucketId =>
                  setState(state => ({
                    ...state,
                    awsBucketId,
                  }))
                }
              />

              <TextField
                label="Objects prefix"
                value={state.ObjectsPrefix}
                placeholder="translations/"
                onChange={ObjectsPrefix =>
                  setState(state => ({
                    ...state,
                    ObjectsPrefix,
                  }))
                }
                info="When empty, generated files will be stored as root objects in the bucket"
              />

              <TextField
                label="AWS region"
                value={state.awsRegion}
                placeholder=""
                onChange={awsRegion =>
                  setState(state => ({
                    ...state,
                    awsRegion,
                  }))
                }
                info="eg. us-east-1"
              />

              <TextField
                label="IAM user access key id"
                value={state.awsAccessKeyId}
                placeholder=""
                onChange={awsAccessKeyId =>
                  setState(state => ({
                    ...state,
                    awsAccessKeyId,
                  }))
                }
                info="Encrypted in our database, only used when syncing your destination"
              />

              <TextField
                label="IAM user secret access key"
                value={state.awsSecretAccessKey}
                placeholder=""
                onChange={awsSecretAccessKey =>
                  setState(state => ({
                    ...state,
                    awsSecretAccessKey,
                  }))
                }
                info="Encrypted in our database, only used when syncing your destination"
              />
            </>
          )}
        </Stack>
      </Stack>
    </ModalContent>
  )
}

export const CreateDestinationModal = forwardRef<CreateDestinationModalRef>(
  (_props, ref) => {
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
