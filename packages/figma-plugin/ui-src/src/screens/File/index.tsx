import { useBridge } from '../../contexts/Bridge'
import { FileOnboarding } from './screens/FileOnboarding/FileOnboarding'
import { Inspect } from './screens/Inspect/Inspect'
import { Settings } from './screens/Settings/Settings'
import { SyncLoader } from './components/SyncLoader'
import { useSync } from './hooks'
import { Header } from './components/Header'

export const File = () => {
  const { file, screen } = useBridge()
  const { sync, isLoading } = useSync()

  if (!file.config) {
    return <FileOnboarding />
  }

  return (
    <>
      <Header onRequestSync={sync} isSyncing={isLoading} />

      {isLoading && <SyncLoader />}
      {!isLoading && screen === 'Inspect' && <Inspect />}
      {!isLoading && screen === 'Settings' && <Settings onRequestSync={sync} />}
    </>
  )
}
