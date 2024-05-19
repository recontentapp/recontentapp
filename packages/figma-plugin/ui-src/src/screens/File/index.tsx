import { MinimalButton, Tooltip } from 'design-system'
import { Screen, useBridge } from '../../contexts/Bridge'
import { FileOnboarding } from './screens/FileOnboarding/FileOnboarding'
import { Inspect } from './screens/Inspect/Inspect'
import { Settings } from './screens/Settings'
import { Tabs } from '../../components/Tabs'
import { styled } from '../../theme'
import { Loader } from './components/Loader'
import { useSync } from './hooks'

const Header = styled('header', {
  position: 'sticky',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  top: 0,
  borderBottom: '1px solid $gray4',
  paddingLeft: '$space80',
  paddingRight: '$space40',
  paddingTop: '$space60',
  backgroundColor: '$white',
})

export const File = () => {
  const { file, screen, currentPage, updateScreen } = useBridge()
  const { sync, isLoading } = useSync()

  if (!file.config) {
    return <FileOnboarding />
  }

  const tooltipTitle = currentPage.lastSyncedAt
    ? `Sync from Recontent.app (Last ${new Date(currentPage.lastSyncedAt).toDateString()})`
    : 'Sync from Recontent.app'

  return (
    <>
      <Header>
        <Tabs<Screen>
          label="Tabs"
          tabs={[
            { label: 'Inspect', value: 'Inspect' },
            { label: 'Settings', value: 'Settings' },
          ]}
          currentTab={screen}
          onSelect={tab => updateScreen(tab)}
        />

        <div style={{ transform: 'translateX(-1px) translateY(-4px)' }}>
          <Tooltip title={tooltipTitle} position="bottom" wrap>
            <MinimalButton
              icon="sync"
              isLoading={isLoading}
              size="xsmall"
              onAction={sync}
            >
              Sync
            </MinimalButton>
          </Tooltip>
        </div>
      </Header>

      {isLoading && <Loader />}

      {!isLoading && screen === 'Inspect' && <Inspect />}
      {!isLoading && screen === 'Settings' && <Settings />}
    </>
  )
}
