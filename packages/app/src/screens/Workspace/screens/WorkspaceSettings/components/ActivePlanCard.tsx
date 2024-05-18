import {
  Badge,
  Box,
  Button,
  ConfirmationModal,
  ConfirmationModalRef,
  Heading,
  Stack,
  Text,
} from 'design-system'
import { format, formatShort } from '../../../../../utils/dates'
import { capitalizeFirstLetter } from '../../../../../utils/text'
import { Paths } from '../../../../../generated/typeDefinitions'
import {
  workspaceBillingStatusLabels,
  workspaceBillingStatusVariations,
} from '../../../../../utils/billing'
import { useRef, useState } from 'react'
import {
  useGenerateBillingPortalSession,
  useResetBillingSubscription,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { styled } from '../../../../../theme'

const Container = styled('div', {
  display: 'flex',
  width: '100%',
  position: 'relative',
  backgroundColor: '$white',
  border: '1px solid $gray7',
  borderRadius: '$radius200',
  boxShadow: '$shadow200',
  paddingY: '$space200',
  paddingX: '$space200',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  '&::after': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    content: '',
    display: 'block',
    width: '100%',
    height: 3,
    backgroundColor: '$purple800',
    borderTopRightRadius: '$radius200',
    borderTopLeftRadius: '$radius200',
  },
})

interface Props {
  settings: Paths.GetBillingSettings.Responses.$200
  activeSubscription: NonNullable<Paths.GetBillingActiveSubscription.Responses.$200>
  onChange: () => void
}

export const ActivePlanCard = ({
  settings,
  activeSubscription,
  onChange,
}: Props) => {
  const { id: workspaceId } = useCurrentWorkspace()
  const [isGeneratingPortalSession, setIsGeneratingPortalSession] =
    useState(false)

  const { mutateAsync: generatePortalSession } =
    useGenerateBillingPortalSession()
  const { mutateAsync: reset, isPending: isResetting } =
    useResetBillingSubscription({
      onSuccess: onChange,
    })
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)

  const onRequestCancel = () => {
    setIsGeneratingPortalSession(true)

    generatePortalSession({
      body: {
        workspaceId,
      },
    })
      .then(res => {
        window.location.href = res.url
      })
      .catch(() => {
        setIsGeneratingPortalSession(false)
      })
  }

  const cancelSubscriptionAction = {
    label: 'Cancel subscription',
    variation: 'secondary' as const,
    onAction: onRequestCancel,
    isLoading: isGeneratingPortalSession,
  }

  const downgradeAction = {
    label: 'Go back to Free plan',
    variation: 'primary' as const,
    onAction: () => {
      reset({
        body: {
          workspaceId,
        },
      })
    },
    isLoading: isResetting,
  }

  const action =
    activeSubscription.status === 'inactive'
      ? downgradeAction
      : cancelSubscriptionAction

  return (
    <Container>
      <Stack width="100%" direction="column" spacing="$space300">
        <Stack direction="column" spacing="$space100">
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing="$space40" alignItems="center">
              <Heading
                size="$size300"
                renderAs="span"
                maxWidth={200}
                withEllipsis
              >
                {capitalizeFirstLetter(activeSubscription.plan)}
              </Heading>

              <Box display="block">
                <Badge
                  variation={
                    workspaceBillingStatusVariations[activeSubscription.status]
                  }
                  size="small"
                >
                  {workspaceBillingStatusLabels[activeSubscription.status]}
                </Badge>
              </Box>
            </Stack>

            <Stack direction="row" spacing="$space60">
              <Button
                variation={action.variation}
                size="small"
                onAction={action.onAction}
                isLoading={action.isLoading}
              >
                {action.label}
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" renderAs="ul" spacing="$space200">
            <Stack direction="column" spacing="$space60" renderAs="li">
              <Text size="$size80" color="$gray14" variation="bold">
                Entity name
              </Text>
              <Text size="$size80" color="$gray11">
                {settings.name ?? 'n/a'}
              </Text>
            </Stack>

            <Stack direction="column" spacing="$space60" renderAs="li">
              <Text size="$size80" color="$gray14" variation="bold">
                Email address
              </Text>
              <Text size="$size80" color="$gray11">
                {settings.email ?? 'n/a'}
              </Text>
            </Stack>

            <Stack direction="column" spacing="$space60" renderAs="li">
              <Text size="$size80" color="$gray14" variation="bold">
                Subscription start date
              </Text>
              <Text size="$size80" color="$gray11">
                {format(new Date(activeSubscription.startDate))}
              </Text>
            </Stack>

            {activeSubscription.endDate && (
              <Stack direction="column" spacing="$space60" renderAs="li">
                <Text size="$size80" color="$gray14" variation="bold">
                  Subscription end date
                </Text>
                <Text size="$size80" color="$gray11">
                  {format(new Date(activeSubscription.endDate))}
                </Text>
              </Stack>
            )}
          </Stack>
        </Stack>

        <Stack direction="column" spacing="$space80">
          <Stack direction="row" alignItems="center" spacing="$space60">
            <Heading size="$size100" renderAs="span">
              Current period
            </Heading>

            <Text size="$size60" color="$gray11">
              From{' '}
              {formatShort(new Date(activeSubscription.currentPeriod.start))} to{' '}
              {formatShort(new Date(activeSubscription.currentPeriod.end))}
            </Text>
          </Stack>

          {/* <Stack direction="row" justifyContent={'space-between'}>
            <Stack direction="row" renderAs="ul" spacing="$space300">
              <Stack direction="column" spacing="$space60" renderAs="li">
                <Text size="$size80" color="$gray14" variation="bold">
                  Phrases usage
                </Text>

                <Stack direction="row" spacing="$space60" alignItems="center">
                  <Stack direction="row" spacing="$space40" alignItems="center">
                    <Text size="$size80" color="$gray11">
                      None
                    </Text>

                    <Tooltip title="1000/m" position="top">
                      <span style={{ paddingTop: 2 }}>
                        <Icon src="info" size={16} color="$gray9" />
                      </span>
                    </Tooltip>
                  </Stack>

                  <Badge variation="primary" size="small">
                    {Intl.NumberFormat('en', {
                      notation: 'compact',
                    }).format(20)}{' '}
                    included
                  </Badge>
                </Stack>
              </Stack>

              <Stack direction="column" spacing="$space60" renderAs="li">
                <Text size="$size80" color="$gray14" variation="bold">
                  Auto translation usage
                </Text>

                <Stack direction="row" spacing="$space60" alignItems="center">
                  <Stack direction="row" spacing="$space40" alignItems="center">
                    <Text size="$size80" color="$gray11">
                      None
                    </Text>

                    <Tooltip title="1000/m" position="top">
                      <span style={{ paddingTop: 2 }}>
                        <Icon src="info" size={16} color="$gray9" />
                      </span>
                    </Tooltip>
                  </Stack>

                  <Badge variation="primary" size="small">
                    {Intl.NumberFormat('en', {
                      notation: 'compact',
                    }).format(10)}{' '}
                    included
                  </Badge>
                </Stack>
              </Stack>
            </Stack>

            <Stack direction="column" spacing="$space0" alignItems="flex-end">
              <Heading size="$size300" renderAs="span">
                {new Intl.NumberFormat('en', {
                  style: 'currency',
                  currency: 'USD',
                }).format(Math.round(200 / 100))}
              </Heading>

              <Stack direction="row" spacing="$space40" alignItems="center">
                <Text size="$size60" color="$gray11">
                  Current period costs
                </Text>

                <Tooltip title={'No usage reported yet'} position="top">
                  <span style={{ paddingTop: 2 }}>
                    <Icon src="info" size={16} color="$gray9" />
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack> */}
        </Stack>
      </Stack>

      <ConfirmationModal
        ref={confirmationModalRef}
        title="Are you sure about cancelling your subscription?"
        description="Once cancelled, you'll directly loose access to your plan's features & need to subscribe again to access them."
        variation="danger"
      />
    </Container>
  )
}
