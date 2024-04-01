import { FC, useRef } from 'react'

import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import {
  Banner,
  Box,
  ConfirmationModal,
  ConfirmationModalRef,
  DropdownButton,
  ExternalLink,
  Heading,
  Stack,
  Table,
} from '../../../../../components/primitives'
import { formatRelative } from '../../../../../utils/dates'
import { useReferenceableAccounts } from '../../../hooks/referenceable'
import { AddAPIKeyForm } from '../components/AddAPIKeyForm'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import {
  getListWorkspaceAccountsQueryKey,
  useDeleteWorkspaceServiceAccount,
  useListWorkspaceAccounts,
} from '../../../../../generated/reactQuery'
import { useQueryClient } from '@tanstack/react-query'

export const Integrations: FC = () => {
  const queryClient = useQueryClient()
  const { getName } = useReferenceableAccounts()
  const { id: workspaceId } = useCurrentWorkspace()
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
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
                href="https://recontent.app/docs/cli"
                title="CLI documentation"
                target="_blank"
              >
                CLI
              </ExternalLink>{' '}
              documentation or{' '}
              <ExternalLink
                fontSize="$fontSize80"
                icon={false}
                href="https://recontent.app/docs/api"
                title="REST API documentation"
                target="_blank"
              >
                REST API
              </ExternalLink>{' '}
              documentation to learn more.
            </span>
          }
        />
      </Box>

      <Stack direction="column" spacing="$space300">
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
