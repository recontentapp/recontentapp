import { FC, forwardRef, useImperativeHandle, useRef } from 'react'

import {
  Heading,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  Text,
} from 'design-system'
import { useNavigate } from 'react-router-dom'
import { useHasAbility, useLooseCurrentWorkspace } from '../hooks/workspace'
import routes from '../routing'
import { PlanCard } from '../screens/Workspace/screens/WorkspaceSettings/components/PlanCard'
import { freePlan, proPlan } from '../utils/billing'

export interface UpsellModalRef {
  open: () => void
  close: () => void
}

interface ContentProps {
  onUpsell: () => void
}

const Content: FC<ContentProps> = ({ onUpsell }) => {
  const canManageBilling = useHasAbility('billing:manage')

  const title = canManageBilling
    ? "You've reached the limits of your current plan."
    : 'Your workspace has reached the limits of its current plan.'
  const description = canManageBilling
    ? 'In order to get more value from Recontent.app, please consider upgrading to another plan. If you have any question or feedback, please reach out.'
    : "In order to get more value from Recontent.app, please contact one your workspace's owners to upgrade to another plan."

  return (
    <ModalContent>
      <Stack direction="column" spacing="$space200">
        <Stack direction="column" spacing="$space40">
          <Heading size="$size200" renderAs="h1" color="$gray14">
            {title}
          </Heading>

          <Text
            color="$gray11"
            size="$size80"
            lineHeight="$lineHeight200"
            maxWidth={540}
          >
            {description}
          </Text>
        </Stack>

        <Stack direction="row" spacing="$space100">
          <PlanCard
            isActive
            title={freePlan.name}
            price={new Intl.NumberFormat('en', {
              style: 'currency',
              currency: proPlan.currency,
            }).format(freePlan.subscriptionAmount / 100)}
            description={freePlan.description}
            items={freePlan.features}
          />

          <PlanCard
            title={proPlan.name}
            price={new Intl.NumberFormat('en', {
              style: 'currency',
              currency: proPlan.currency,
            }).format(proPlan.subscriptionAmount / 100)}
            description={proPlan.description}
            items={proPlan.features}
            primaryAction={{
              label: 'Subscribe to Recontent.app',
              onAction: onUpsell,
              isLoading: false,
              isDisabled: !canManageBilling,
            }}
          />
        </Stack>
      </Stack>
    </ModalContent>
  )
}

export const UpsellModal = forwardRef<UpsellModalRef>((_props, ref) => {
  const navigate = useNavigate()
  const modalRef = useRef<ModalRef>(null!)
  const { currentWorkspace } = useLooseCurrentWorkspace()

  useImperativeHandle(ref, () => ({
    open: () => {
      if (!currentWorkspace) {
        return
      }

      modalRef.current.open()
    },
    close: () => {
      modalRef.current.close()
    },
  }))

  return (
    <Modal ref={modalRef}>
      <Content
        onUpsell={() => {
          if (!currentWorkspace) {
            return
          }

          modalRef.current.close()
          navigate(
            routes.workspaceSettingsBilling.url({
              pathParams: { workspaceKey: currentWorkspace.key },
            }),
          )
        }}
      />
    </Modal>
  )
})
