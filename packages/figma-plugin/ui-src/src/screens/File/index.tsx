import { useBridge } from '../../contexts/Bridge'
import { FileOnboarding } from './screens/FileOnboarding/FileOnboarding'
import { Inspect } from './screens/Inspect/Inspect'
import { Settings } from './screens/Settings/Settings'
import { SyncLoader } from './components/SyncLoader'
import { useFile, useSync } from './hooks'
import { Header } from './components/Header'
import { ErrorLoadingFile } from './screens/ErrorLoadingFile'
import { FullpageSpinner } from '../../components/FullpageSpinner'

export const File = () => {
  const { file, screen } = useBridge()
  const { sync, isLoading } = useSync()
  const { isPending, error } = useFile()

  if (!file.config) {
    return <FileOnboarding />
  }

  if (isPending) {
    return <FullpageSpinner />
  }

  if (error) {
    return <ErrorLoadingFile />
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
