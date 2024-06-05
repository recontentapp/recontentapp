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
  useCreateGithubDestination,
  useCreateGoogleCloudStorageDestination,
  useGetInstallationRepositories,
  useGetInstallationRepositoryBranches,
  useListGithubInstallations,
} from '../../../../generated/reactQuery'
import { fileFormatLabels } from '../../../../utils/files'
import { useQueryClient } from '@tanstack/react-query'
import {
  destinationSyncFrequencyLabels,
  destinationTypeLabels,
} from '../../../../utils/destinations'
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
  syncFrequency: Components.Schemas.DestinationSyncFrequency
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
  githubInstallationId: string
  githubRepositoryId: string
  githubBaseBranchName: string
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
      return (
        state.name.length > 0 &&
        !!state.revisionId &&
        state.githubInstallationId.length > 0 &&
        state.githubRepositoryId.length > 0 &&
        state.githubBaseBranchName.length > 0
      )
  }
}

const Content: FC<ContentProps> = ({ project, close }) => {
  const queryClient = useQueryClient()
  const {
    settings: { cdnAvailable, githubAppAvailable, workerAvailable },
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
  const { mutateAsync: createGithub, isPending: isCreatingGithub } =
    useCreateGithubDestination({
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
    syncFrequency: 'manually',
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
    githubInstallationId: '',
    githubRepositoryId: '',
    githubBaseBranchName: '',
  })

  const { data: githubInstallations } = useListGithubInstallations(
    { queryParams: { workspaceId: project.workspaceId } },
    { enabled: githubAppAvailable },
  )

  const { data: githubRepositories } = useGetInstallationRepositories(
    { queryParams: { installationId: state.githubInstallationId } },
    { enabled: state.githubInstallationId.length > 0 },
  )

  const repositoryNameWithOwner =
    githubRepositories?.items.find(i => i.cursor === state.githubRepositoryId)
      ?.name ?? null

  const { data: githubBranches } = useGetInstallationRepositoryBranches(
    {
      queryParams: {
        installationId: state.githubInstallationId,
        repositoryNameWithOwner: String(repositoryNameWithOwner),
      },
    },
    { enabled: !!repositoryNameWithOwner },
  )

  const isCreating =
    isCreatingCDN ||
    isCreatingGoogleCloudStorage ||
    isCreatingAWSS3 ||
    isCreatingGithub

  const onSubmit = () => {
    if (isCreating) {
      return
    }

    switch (state.type) {
      case 'cdn': {
        createCDN({
          body: {
            syncFrequency: state.syncFrequency,
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
      case 'aws_s3': {
        createAWSS3({
          body: {
            syncFrequency: state.syncFrequency,
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
      }
      case 'google_cloud_storage': {
        createGoogleCloudStorage({
          body: {
            syncFrequency: state.syncFrequency,
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
      case 'github': {
        const [repositoryOwner, repositoryName] =
          repositoryNameWithOwner?.split('/') ?? ['', '']
        createGithub({
          body: {
            syncFrequency: state.syncFrequency,
            revisionId: state.revisionId!,
            fileFormat: state.fileFormat,
            includeEmptyTranslations: state.includeEmptyTranslations,
            name: state.name,
            objectsPrefix:
              state.ObjectsPrefix.length > 0 ? state.ObjectsPrefix : undefined,
            repositoryOwner,
            repositoryName,
            baseBranchName: state.githubBaseBranchName,
            installationId: state.githubInstallationId,
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

        if (item.value === 'github') {
          return githubAppAvailable
        }

        return true
      })
  }, [cdnAvailable, githubAppAvailable])

  const syncFrequencyOptions = useMemo(() => {
    if (workerAvailable) {
      return Object.entries(destinationSyncFrequencyLabels).map(
        ([value, label]) => ({
          label,
          value,
        }),
      )
    }

    return [
      {
        label: 'Manually',
        value: 'manually',
      },
    ]
  }, [workerAvailable])

  const isStateValid = isValid(state)

  return (
    <ModalContent
      asForm
      contextTitle={project?.name}
      title="Create destination"
      primaryAction={{
        label: 'Save destination',
        isLoading: isCreating,
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

        {syncFrequencyOptions.length > 1 && (
          <SelectField
            label="Sync frequency"
            options={syncFrequencyOptions}
            value={state.syncFrequency}
            onChange={option => {
              if (!option) {
                return
              }

              setState(state => ({
                ...state,
                syncFrequency:
                  option.value as Components.Schemas.DestinationSyncFrequency,
              }))
            }}
          />
        )}

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

          {state.type === 'github' && (
            <>
              <SelectField
                label="Installation ID"
                options={(githubInstallations?.items ?? []).map(item => ({
                  label: item.githubAccount,
                  value: item.id,
                }))}
                value={state.githubInstallationId}
                onChange={option => {
                  if (!option) {
                    return
                  }

                  setState(state => ({
                    ...state,
                    githubInstallationId: option.value,
                  }))
                }}
              />

              <SelectField
                label="Repository"
                options={(githubRepositories?.items ?? []).map(item => ({
                  label: item.name,
                  value: item.cursor,
                }))}
                value={state.githubRepositoryId}
                onChange={option => {
                  if (!option) {
                    return
                  }

                  setState(state => ({
                    ...state,
                    githubRepositoryId: option.value,
                  }))
                }}
              />

              <SelectField
                label="Base branch name"
                options={(githubBranches?.items ?? []).map(item => ({
                  label: item.name,
                  value: item.name,
                }))}
                value={state.githubBaseBranchName}
                onChange={option => {
                  if (!option) {
                    return
                  }

                  setState(state => ({
                    ...state,
                    githubBaseBranchName: option.value,
                  }))
                }}
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
                info="When empty, generated files will be stored at the repository's root."
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
