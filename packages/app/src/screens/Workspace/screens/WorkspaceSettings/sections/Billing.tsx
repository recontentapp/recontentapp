import { FC, useState } from 'react'

import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import { Banner, Stack } from 'design-system'
import { PlanCard } from '../components/PlanCard'
import {
  getGetBillingActiveSubscriptionQueryKey,
  getGetBillingSettingsQueryKey,
  getGetWorkspaceAbilitiesQueryKey,
  getGetWorkspaceBillingStatusQueryKey,
  useGenerateBillingPortalSession,
  useGetBillingActiveSubscription,
  useGetBillingSettings,
  useSubscribeToBillingPlan,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { BillingWizard } from '../components/BillingWizard'
import { ActivePlanCard } from '../components/ActivePlanCard'
import { useQueryClient } from '@tanstack/react-query'
import { InvoicesTable } from '../components/InvoicesTable'
import { proPlan } from '../../../../../utils/billing'

export const Billing: FC = () => {
  const queryClient = useQueryClient()
  const [isGeneratingPortalSession, setIsGeneratingPortalSession] =
    useState(false)
  const { id: workspaceId } = useCurrentWorkspace()

  const invalidateCache = () => {
    queryClient.removeQueries({
      queryKey: getGetBillingActiveSubscriptionQueryKey({
        queryParams: {
          workspaceId,
        },
      }),
    })
    queryClient.invalidateQueries({
      queryKey: getGetBillingSettingsQueryKey({
        queryParams: {
          workspaceId,
        },
      }),
    })
    queryClient.invalidateQueries({
      queryKey: getGetWorkspaceBillingStatusQueryKey({
        queryParams: {
          workspaceId,
        },
      }),
    })
    queryClient.invalidateQueries({
      queryKey: getGetWorkspaceAbilitiesQueryKey({
        queryParams: { workspaceId },
      }),
    })
  }

  const { mutateAsync: subscribe, isPending: isSubscribing } =
    useSubscribeToBillingPlan({
      onSuccess: invalidateCache,
    })
  const { mutateAsync: generatePortalSession } =
    useGenerateBillingPortalSession()
  const { data: settings, isPending: isLoadingSettings } =
    useGetBillingSettings(
      {
        queryParams: {
          workspaceId,
        },
      },
      {
        retry: false,
      },
    )
  const { data: activeSubscription, isPending: isLoadingActiveSubscription } =
    useGetBillingActiveSubscription(
      {
        queryParams: {
          workspaceId,
        },
      },
      {
        retry: false,
      },
    )

  const subscribeAction = {
    label: 'Subscribe to Recontent.app',
    onAction: () => {
      subscribe({
        body: {
          workspaceId,
          plan: 'pro',
        },
      })
    },
    isLoading: isSubscribing,
  }

  const portalAction = {
    label: 'Add payment method',
    onAction: () => {
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
    },
    isLoading: isGeneratingPortalSession,
  }

  if (isLoadingSettings || isLoadingActiveSubscription) {
    return <HorizontalSpinner />
  }

  return (
    <Stack width="100%" direction="column" spacing="$space300" maxWidth={800}>
      {settings && !settings.hasPaymentMethod && (
        <Banner
          variation="info"
          title="Payment method missing"
          description='In order to subscribe to Recontent.app, make sure to add a payment method by either clicking "Add payment method" or "Open billing portal".'
        />
      )}

      {!settings && <BillingWizard onChange={invalidateCache} />}

      {settings && activeSubscription && (
        <ActivePlanCard
          settings={settings}
          activeSubscription={activeSubscription}
          onChange={invalidateCache}
        />
      )}

      {settings && !activeSubscription && (
        <Stack direction="row" spacing="$space100">
          <PlanCard
            isActive
            title="Free plan"
            price={new Intl.NumberFormat('en', {
              style: 'currency',
              currency: proPlan.currency,
            }).format(0)}
            description="To discover Recontent.app and its features."
            items={[
              '1 project max.',
              '1 000 translations max.',
              'Import/Export',
              'Tags',
              'API & CLI for developers',
            ]}
            primaryAction={
              settings.hasPaymentMethod ? subscribeAction : portalAction
            }
          />
          <PlanCard
            title={proPlan.name}
            price={new Intl.NumberFormat('en', {
              style: 'currency',
              currency: proPlan.currency,
            }).format(proPlan.subscriptionAmount / 100)}
            description={proPlan.description}
            items={proPlan.features}
            primaryAction={
              settings.hasPaymentMethod ? subscribeAction : portalAction
            }
          />
        </Stack>
      )}

      {settings && <InvoicesTable />}
    </Stack>
  )
}
