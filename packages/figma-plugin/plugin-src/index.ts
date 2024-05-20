import {
  FileConfigSet,
  NotificationRequested,
  TextsSyncReceived,
  UserConfigUpdated,
} from '../shared-types'
import { $emit, $on } from './src/io'
import { getSelectedTraversedTextNodes } from './src/selection'
import { getUserConfig, setUserConfig } from './src/storage/config'
import { getFileConfig, resetFileData, setFileConfig } from './src/storage/file'
import { getPageLastSyncedAt, setPageLastSyncedAt } from './src/storage/page'
import { getTextData, syncTextData } from './src/storage/texts'
import { Emittable, Receivable } from './src/types'

figma.skipInvisibleInstanceChildren = true
figma.showUI(__html__, { themeColors: true, height: 380, width: 360 })

const emit = $emit<Emittable>()

const onPluginInitialized = async () => {
  const userConfig = await getUserConfig()
  const fileConfig = getFileConfig()
  const { texts, traversed } = getSelectedTraversedTextNodes()

  emit({
    type: 'plugin-initialized',
    data: {
      userConfig,
      file: {
        name: figma.root.name,
        config: fileConfig,
      },
      currentPage: {
        nodeId: figma.currentPage.id,
        lastSyncedAt: getPageLastSyncedAt(),
      },
      selection: {
        texts: texts.map(getTextData),
        traversed,
      },
    },
  })
}

$on<Receivable>({
  'file-config-reset-requested': () => {
    resetFileData()
    onPluginInitialized()
  },
  'user-config-reset-requested': () => {
    setUserConfig(null)
    onPluginInitialized()
  },
  'user-config-updated': (data: UserConfigUpdated) => {
    setUserConfig(data.data)
    onPluginInitialized()
  },
  'file-config-set': (data: FileConfigSet) => {
    setFileConfig(data.data)
    onPluginInitialized()
  },
  'notification-requested': (data: NotificationRequested) => {
    figma.notify(data.data.message, { error: data.data.type === 'error' })
  },
  'texts-sync-received': async (data: TextsSyncReceived) => {
    await Promise.all(data.data.items.map(syncTextData))
    if (data.data.type === 'complete') {
      setPageLastSyncedAt(Date.now())
    }
    onPluginInitialized()
  },
})

onPluginInitialized()

figma.on('currentpagechange', () => {
  onPluginInitialized()
})

figma.on('selectionchange', () => {
  const { texts, traversed } = getSelectedTraversedTextNodes()

  emit({
    type: 'text-selection-changed',
    data: {
      texts: texts.map(getTextData),
      traversed,
    },
  })
})
