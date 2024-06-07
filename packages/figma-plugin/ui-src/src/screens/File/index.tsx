import { FullpageSpinner } from '../../components/FullpageSpinner'
import { useBridge } from '../../contexts/Bridge'
import { Header } from './components/Header'
import { SyncLoader } from './components/SyncLoader'
import { useFile, useSync } from './hooks'
import { ErrorLoadingFile } from './screens/ErrorLoadingFile'
import { FileOnboarding } from './screens/FileOnboarding/FileOnboarding'
import { Inspect } from './screens/Inspect/Inspect'
import { Settings } from './screens/Settings/Settings'

export const File = () => {
  const { file, screen } = useBridge()
  const { sync, isLoading } = useSync()
  const { isPending, error } = useFile()

  if (!file.config) {
    return <FileOnboarding />
  }

  if (error) {
    return <ErrorLoadingFile />
  }

  if (isPending) {
    return <FullpageSpinner />
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
