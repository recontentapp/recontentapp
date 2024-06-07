import { FC, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Banner,
  Box,
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  DropdownButton,
  ExternalLink,
  Heading,
  Stack,
  Table,
} from 'design-system'
import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import {
  getListWorkspaceAccountsQueryKey,
  useDeleteWorkspaceServiceAccount,
  useGetGithubAppInstallationLink,
  useListGithubInstallations,
  useListWorkspaceAccounts,
} from '../../../../../generated/reactQuery'
import { useSystem } from '../../../../../hooks/system'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { formatRelative } from '../../../../../utils/dates'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { AddAPIKeyForm } from '../components/AddAPIKeyForm'
import { GithubInstallationCard } from '../components/GithubInstallationCard'

export const Integrations: FC = () => {
  const queryClient = useQueryClient()
  const { getName } = useReferenceableAccounts()
  const { id: workspaceId } = useCurrentWorkspace()
  const {
    settings: { githubAppAvailable },
  } = useSystem()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const { data: installationLinkData } = useGetGithubAppInstallationLink({
    enabled: githubAppAvailable,
  })
  const { data: installationsData } = useListGithubInstallations(
    {
      queryParams: {
        workspaceId,
      },
    },
    {
      enabled: githubAppAvailable,
    },
  )
  const { isPending, data } = useListWorkspaceAccounts({
    queryParams: {
      workspaceId,
      type: 'service',
    },
  })
  const { mutateAsync: deleteServiceAccount } =
    useDeleteWorkspaceServiceAccount({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListWorkspaceAccountsQueryKey({
            queryParams: {
              workspaceId,
              type: 'service',
            },
          }),
        })
      },
    })

  const onRequestDelete = (id: string) => {
    confirmationModalRef.current.confirm().then(result => {
      if (!result) {
        return
      }

      deleteServiceAccount({
        body: { id },
      })
    })
  }

  if (isPending || !data) {
    return <HorizontalSpinner />
  }

  return (
    <Stack width="100%" direction="column" spacing="$space300">
      <ConfirmationModal
        ref={confirmationModalRef}
        title="Are you sure about deleting this API key"
        description="Once deleted, integrations using it will likely encounter issues."
        variation="danger"
      />

      <Box maxWidth={700}>
        <Banner
          variation="info"
          title="Working on custom integrations or development workflows?"
          description={
            <span>
              Generate an API key here to integrate Recontent with other
              services. Check out our{' '}
              <ExternalLink
                fontSize="$fontSize80"
                icon={false}
                href="https://docs.recontent.app/developers/command-line-interface-cli"
                title="CLI documentation"
              >
                CLI
              </ExternalLink>{' '}
              documentation or{' '}
              <ExternalLink
                fontSize="$fontSize80"
                icon={false}
                href="https://docs.recontent.app/developers/rest-api"
                title="REST API documentation"
              >
                REST API
              </ExternalLink>{' '}
              documentation to learn more.
            </span>
          }
        />
      </Box>

      <Stack direction="column" spacing="$space300">
        {githubAppAvailable && (
          <Stack direction="column" spacing="$space100">
            <Stack direction="row" spacing="$space60" alignItems="center">
              <Heading size="$size100" renderAs="h2">
                Connected GitHub accounts
              </Heading>

              <Button
                variation="primary"
                size="xsmall"
                icon="add"
                isLoading={!installationLinkData}
                onAction={() => {
                  if (!installationLinkData) {
                    return
                  }

                  window.open(
                    `${installationLinkData.url}?state=${workspaceId}`,
                    '_blank',
                  )
                }}
              >
                Add
              </Button>
            </Stack>

            {installationsData && (
              <Stack direction="row" flexWrap="wrap" spacing="$space80">
                {installationsData.items.map(installation => (
                  <GithubInstallationCard
                    key={installation.id}
                    active
                    title={installation.githubAccount}
                    createdBy={`Added by ${getName(installation.createdBy)}`}
                    onAction={() => {
                      window.open(installation.githubUrl, '_blank')
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}

        <Stack direction="column" spacing="$space100">
          <Heading size="$size100" renderAs="h2">
            API keys
          </Heading>
          <Table
            isLoading={isPending}
            footerAdd={({ requestClose }) => (
              <AddAPIKeyForm onClose={requestClose} />
            )}
            items={data.items}
            columns={[
              {
                headerCell: 'Name',
                isPrimary: true,
                width: 200,
                key: 'name',
                bodyCell: key => (
                  <span
                    style={{
                      maxWidth: 300,
                      display: 'inline-block',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {key.service?.name ?? ''}
                  </span>
                ),
              },
              {
                headerCell: 'Created by',
                key: 'createdBy',
                bodyCell: key => <p>{getName(key.invitedBy ?? '')}</p>,
              },
              {
                headerCell: 'Created on',
                key: 'createdAt',
                bodyCell: key => (
                  <span>{formatRelative(new Date(key.createdAt))}</span>
                ),
              },
              {
                headerCell: 'Actions',
                key: 'actions',
                bodyCell: key => (
                  <DropdownButton
                    variation="minimal"
                    icon="more"
                    items={[
                      {
                        label: 'Delete',
                        icon: 'delete',
                        variation: 'danger',
                        onSelect: () => onRequestDelete(key.id),
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
