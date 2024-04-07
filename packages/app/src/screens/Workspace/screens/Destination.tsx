import { FC, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../components/FullpageSpinner'
import { Head } from '../../../components/Head'
import {
  Banner,
  Box,
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  DangerZone,
  Metadata,
  Stack,
  toast,
} from '../../../components/primitives'
import { styled } from '../../../theme'
import { formatRelative } from '../../../utils/dates'
import { Page } from '../components/Page'
import { ScreenWrapper } from '../components/ScreenWrapper'
import {
  getGetDestinationQueryKey,
  getListDestinationsQueryKey,
  useDeleteDestination,
  useGetDestination,
  useGetProject,
  useSyncDestination,
} from '../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../hooks/workspace'
import routes from '../../../routing'
import { destinationTypeLabels } from '../../../utils/destinations'
import { fileFormatLabels } from '../../../utils/files'
import { useQueryClient } from '@tanstack/react-query'

const ErrorMessage = styled('span', {
  display: 'inline-block',
  marginTop: '$space40',
  fontFamily: '$mono',
  fontSize: '$size60',
  borderRadius: '$radius200',
  paddingX: '$space40',
  paddingY: '$space20',
  backgroundColor: '$orange200',
})

const Output = styled('pre', {
  fontFamily: '$mono',
  fontSize: '$size80',
  lineHeight: '$lineHeight200',
  backgroundColor: '$gray3',
  paddingX: '$space100',
  paddingY: '$space80',
  color: '$gray14',
  borderRadius: '$radius200',
})

export const Destination: FC = () => {
  const queryClient = useQueryClient()
  const params = useParams<'projectId' | 'destinationId'>()
  const navigate = useNavigate()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const {
    mutateAsync: syncDestination,
    isPending: isRequestingSyncDestination,
  } = useSyncDestination({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGetDestinationQueryKey({
          queryParams: { destinationId: params.destinationId! },
        }),
      })
    },
  })
  const { mutateAsync: deleteDestination, isPending: isDeletingDestination } =
    useDeleteDestination({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListDestinationsQueryKey({
            queryParams: { projectId: params.projectId! },
          }),
        })
      },
    })
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const {
    data: destination,
    isLoading,
    failureCount,
  } = useGetDestination({
    queryParams: { destinationId: params.destinationId! },
  })

  const { data: project, isLoading: projectLoading } = useGetProject({
    queryParams: { id: params.projectId! },
  })

  const onRequestSyncDestination = () => {
    if (!destination) {
      return
    }

    syncDestination({ body: { destinationId: destination.id } })
      .then(() => {
        toast('success', {
          title: 'Sync request received',
          description: 'Your destination should be synced in a few seconds',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not request destination sync',
          description: 'Feel free to try later or contact us',
        })
      })
  }

  const onRequestDeleteDestination = () => {
    if (!destination) {
      return
    }

    confirmationModalRef.current.confirm().then(result => {
      if (!result) {
        return
      }

      deleteDestination({ body: { destinationId: destination.id } })
        .then(() => {
          toast('success', {
            title: 'Destination deleted',
          })
          navigate(
            routes.projectExport.url({
              pathParams: { workspaceKey, projectId: project!.id },
            }),
          )
        })
        .catch(() => {
          toast('error', {
            title: 'Could not delete destination',
            description: 'Feel free to try later or contact us',
          })
        })
    })
  }

  useEffect(() => {
    if (failureCount > 0) {
      navigate(routes.dashboard.url({ pathParams: { workspaceKey } }))
    }
  }, [failureCount, navigate, workspaceKey])

  if (projectLoading || !project || isLoading || !destination) {
    return <FullpageSpinner />
  }

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: project.name,
          path: routes.projectPhrases.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
              revisionId: project.masterRevisionId,
            },
          }),
        },
        {
          label: 'Export',
          path: routes.projectExport.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
              revisionId: project.masterRevisionId,
            },
          }),
        },
        {
          label: destination.name,
          path: routes.projectDestination.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
              destinationId: destination.id,
            },
          }),
        },
      ]}
    >
      <Head title={destination.name} />
      <Page
        subtitle={destinationTypeLabels[destination.type]}
        title={destination.name}
      >
        <Stack direction="column" spacing="$space600">
          <Stack direction="column" spacing="$space200">
            {destination.lastSyncError && (
              <Banner
                variation="warning"
                title="An error occurred while synchronizing your destination"
                description={
                  <span>
                    Feel free to delete & recreate your destination with a valid
                    configuration. If the error keeps occurring, contact us.{' '}
                    <ErrorMessage>{destination.lastSyncError}</ErrorMessage>
                  </span>
                }
              />
            )}
            <Box width="100%" maxWidth={400}>
              <Metadata
                metadata={[
                  {
                    label: 'Type',
                    value: destinationTypeLabels[destination.type],
                  },
                  {
                    label: 'Last synced',
                    value: destination.lastSuccessfulSyncAt
                      ? formatRelative(
                          new Date(destination.lastSuccessfulSyncAt),
                        )
                      : 'Never',
                  },
                  ...(destination.type === 'cdn'
                    ? [
                        {
                          label: 'File format',
                          value:
                            fileFormatLabels[destination.configCDN!.fileFormat],
                        },
                        {
                          label: 'Include empty translations',
                          value: String(
                            destination.configCDN!.includeEmptyTranslations,
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </Box>

            {destination.lastSyncAt !== null && destination.configCDN?.urls && (
              <Output>
                {JSON.stringify(destination.configCDN.urls, null, 2)}
              </Output>
            )}

            <Stack direction="row" spacing="$space60">
              <Button
                variation="primary"
                isLoading={isRequestingSyncDestination}
                onAction={onRequestSyncDestination}
              >
                Manually sync destination
              </Button>
            </Stack>
          </Stack>

          <Box width="100%" maxWidth={400}>
            <DangerZone
              description="Deleting this destination might break some integrations you built using it."
              cta="Delete destination"
              onAction={onRequestDeleteDestination}
              isLoading={isDeletingDestination}
            />
          </Box>
        </Stack>

        <ConfirmationModal
          ref={confirmationModalRef}
          title="Are you sure about deleting this destination"
          description="Once deleted, a destination can not be recovered."
          variation="danger"
        />
      </Page>
    </ScreenWrapper>
  )
}
