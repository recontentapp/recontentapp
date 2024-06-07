import {
  Badge,
  Button,
  DropdownButton,
  Heading,
  Stack,
  Table,
} from 'design-system'
import { useState } from 'react'
import {
  useGenerateBillingPortalSession,
  useListBillingInvoices,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { capitalizeFirstLetter } from '../../../../../utils/text'

const getBadgeStatus = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success'
    case 'open':
      return 'danger'
    default:
      return 'neutral'
  }
}

export const InvoicesTable = () => {
  const [isGeneratingPortalSession, setIsGeneratingPortalSession] =
    useState(false)
  const { mutateAsync: generatePortalSession } =
    useGenerateBillingPortalSession()
  const { id: workspaceId } = useCurrentWorkspace()

  const { data } = useListBillingInvoices({
    queryParams: {
      workspaceId,
    },
  })

  const onRequestPortalSession = () => {
    setIsGeneratingPortalSession(true)
    generatePortalSession({
      body: {
        workspaceId,
      },
    })
      .then(res => {
        window.open(res.url, '_blank')

        setTimeout(() => {
          setIsGeneratingPortalSession(false)
        }, 1500)
      })
      .catch(() => {
        setIsGeneratingPortalSession(false)
      })
  }

  return (
    <Stack direction="column" spacing="$space80">
      <Stack
        direction="row"
        spacing="$space60"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading size="$size100" renderAs="h2">
          Latest invoices
        </Heading>

        <Button
          variation="secondary"
          icon="exit_to_app"
          size="xsmall"
          onAction={onRequestPortalSession}
          isLoading={isGeneratingPortalSession}
        >
          Open billing portal
        </Button>
      </Stack>

      <Table
        items={data?.items ?? []}
        columns={[
          {
            key: 'Invoice number',
            isPrimary: true,
            headerCell: 'Number',
            bodyCell: item => item.number,
          },
          {
            key: 'status',
            headerCell: 'Status',
            bodyCell: item => (
              <Badge
                variation={getBadgeStatus(item.status ?? 'draft')}
                size="small"
              >
                {item.status ? capitalizeFirstLetter(item.status) : 'unknown'}
              </Badge>
            ),
          },
          {
            key: 'dueDate',
            headerCell: 'Due date',
            bodyCell: item =>
              item.dueDate
                ? new Intl.DateTimeFormat('en-GB').format(
                    new Date(item.dueDate),
                  )
                : '',
          },
          {
            key: 'amount',
            headerCell: 'Amount',
            bodyCell: item =>
              new Intl.NumberFormat('en', {
                style: 'currency',
                currency: item.currency,
              }).format(item.amount / 100),
          },
          {
            headerCell: 'Actions',
            key: 'actions',
            width: 100,
            bodyCell: item => {
              if (!item.url) {
                return null
              }

              return (
                <DropdownButton
                  variation="minimal"
                  icon="more"
                  usePortal={false}
                  items={[
                    {
                      label: 'View invoice',
                      icon: 'link',
                      onSelect: () => {
                        window.open(item.url!, '_blank')
                      },
                    },
                  ]}
                />
              )
            },
          },
        ]}
      />
    </Stack>
  )
}
