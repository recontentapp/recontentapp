import { useBridge } from '../../contexts/Bridge'
import { FileOnboarding } from './screens/FileOnboarding/FileOnboarding'
import { Inspect } from './screens/Inspect'
import { Settings } from './screens/Settings'

export const File = () => {
  const { fileConfig, screen } = useBridge()

  if (!fileConfig) {
    return <FileOnboarding />
  }

  switch (screen) {
    case 'Inspect':
      return <Inspect />
    case 'Settings':
      return <Settings />
  }
}
