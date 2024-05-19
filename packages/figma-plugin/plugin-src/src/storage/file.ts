import { FileConfig } from '../../../shared-types'
import { resetPage } from './page'
import { APP_ID, resetText } from './texts'

const FILE_CONFIG_STORAGE_KEY = 'file_config'

export const getFileConfig = (): FileConfig | null => {
  const config = figma.root.getPluginData(FILE_CONFIG_STORAGE_KEY)

  if (!config) {
    return null
  }

  try {
    const parsedConfig = JSON.parse(config) as FileConfig
    return parsedConfig
  } catch (e) {
    return null
  }
}

export const setFileConfig = async (config: FileConfig) => {
  figma.root.setPluginData(FILE_CONFIG_STORAGE_KEY, JSON.stringify(config))
}

export const resetFile = () => {
  const keys = figma.root.getPluginDataKeys()
  keys.forEach(key => {
    figma.root.setPluginData(key, '')
  })
}

export const resetFileData = async () => {
  await figma.loadAllPagesAsync()

  for (const page of figma.root.children) {
    const textNodes = page.findAllWithCriteria({
      types: ['TEXT'],
      pluginData: {
        keys: [APP_ID],
      },
    })

    for (const node of textNodes) {
      resetText(node)
    }

    resetPage(page)
  }

  resetFile()
}
