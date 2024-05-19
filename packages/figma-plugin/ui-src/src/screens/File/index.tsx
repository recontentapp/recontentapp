import { Box, Icon, MinimalButton, Stack, Tooltip } from 'design-system'
import { Screen, useBridge } from '../../contexts/Bridge'
import { FileOnboarding } from './screens/FileOnboarding/FileOnboarding'
import { Inspect } from './screens/Inspect'
import { Settings } from './screens/Settings'
import { Tabs } from '../../components/Tabs'
import { styled } from '../../theme'

const Header = styled('header', {
  position: 'sticky',
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
  const { fileConfig, screen, updateScreen } = useBridge()

  if (!fileConfig) {
    return <FileOnboarding />
  }

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
          <Tooltip title="Sync from Recontent.app" position="bottom" wrap>
            <MinimalButton icon="sync" size="xsmall" onAction={() => {}} />
          </Tooltip>
        </div>
      </Header>

      {screen === 'Inspect' && <Inspect />}
      {screen === 'Settings' && <Settings />}
    </>
  )
}
