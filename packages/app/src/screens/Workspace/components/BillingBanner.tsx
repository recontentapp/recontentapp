import { Link } from 'react-router-dom'

import { Box, Icon, Stack, Text } from 'design-system'
import { useSystem } from '../../../hooks/system'
import { useLazyGetWorkspaceBillingStatus } from '../../../generated/reactQuery'
import { useCurrentWorkspace, useHasAbility } from '../../../hooks/workspace'
import routes from '../../../routing'
import { styled } from '../../../theme'

const LinkContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  gap: '$space40',
  alignItems: 'center',
  a: {
    color: '$white',
    fontSize: '$size80',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
})

export const BillingBanner = () => {
  const { id: workspaceId, key: workspaceKey } = useCurrentWorkspace()
  const { distribution } = useSystem()
  const { data } = useLazyGetWorkspaceBillingStatus(
    {
      queryParams: {
        workspaceId,
      },
    },
    {
      enabled: distribution !== 'self-hosted',
    },
  )
  const canManageBilling = useHasAbility('billing:manage')

  if (distribution === 'self-hosted' || !data || data.status === 'active') {
    return null
  }

  const description =
    data.status === 'payment_required'
      ? 'In order to continue using your Recontent.app subscription, make sure to add a valid payment method & check your latest invoices.'
      : 'Your Recontent.app subscription is now inactive. You can downgrade your plan or subscribe to a new plan.'

  return (
    <Box
      backgroundColor={
        data.status === 'payment_required' ? '$red200' : '$blue800'
      }
      paddingX="$space200"
      paddingY="$space80"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing="$space100"
        width="100%"
      >
        <Text color="$white" size="$size80" lineHeight="$lineHeight200">
          {description}
        </Text>

        <LinkContainer>
          {canManageBilling && (
            <>
              <Link
                to={routes.workspaceSettingsBilling.url({
                  pathParams: { workspaceKey },
                })}
              >
                Access billing settings
              </Link>

              <Icon src="open_in_new" size={16} color="$white" />
            </>
          )}
        </LinkContainer>
      </Stack>
    </Box>
  )
}
