import { Icon, Spinner, Stack, Text } from 'design-system'
import { Tabs } from '../../../components/Tabs'
import { Screen, useBridge } from '../../../contexts/Bridge'
import { styled } from '../../../theme'
import { formatRelative } from '../../../utils/dates'

const Container = styled('header', {
  position: 'sticky',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  top: 0,
  borderBottom: '1px solid $gray4',
  paddingLeft: '$space80',
  paddingRight: '$space80',
  paddingTop: '$space60',
  backgroundColor: '$white',
})

const Button = styled('button', {
  cursor: 'pointer',
  svg: {
    transition: 'fill 0.1s ease-in-out',
  },
  span: {
    transition: 'color 0.1s ease-in-out',
  },
  '&:hover': {
    svg: {
      fill: '$blue800',
    },
    span: {
      color: '$blue800',
    },
  },
})

interface HeaderProps {
  onRequestSync: () => void
  isSyncing: boolean
}

export const Header = ({ onRequestSync, isSyncing }: HeaderProps) => {
  const { screen, currentPage, updateScreen } = useBridge()

  return (
    <Container>
      <Tabs<Screen>
        label="Tabs"
        tabs={[
          { label: 'Inspect', value: 'Inspect' },
          { label: 'Settings', value: 'Settings' },
        ]}
        currentTab={screen}
        onSelect={tab => updateScreen(tab)}
      />

      <div style={{ transform: 'translateY(-4px)' }}>
        {isSyncing ? (
          <Stack direction="row" alignItems="center" spacing="$space40">
            <Spinner size={14} color="$gray11" />
            <Text
              renderAs="span"
              color="$gray14"
              variation="semiBold"
              size="$size40"
            >
              Sync in progress...
            </Text>
          </Stack>
        ) : (
          <Button onClick={onRequestSync}>
            <Stack direction="row" alignItems="center" spacing="$space40">
              <Icon src="sync" size={16} color="$gray11" />

              <Stack direction="column" alignItems="flex-start">
                <Text
                  renderAs="span"
                  color="$gray14"
                  variation="semiBold"
                  size="$size40"
                >
                  Sync current page
                </Text>
                {currentPage.lastSyncedAt ? (
                  <Text renderAs="span" color="$gray9" size="$size20">
                    Last synced{' '}
                    {formatRelative(new Date(currentPage.lastSyncedAt))}
                  </Text>
                ) : (
                  <Text renderAs="span" color="$gray9" size="$size20">
                    Never synced
                  </Text>
                )}
              </Stack>
            </Stack>
          </Button>
        )}
      </div>
    </Container>
  )
}
