import { FileConfig } from '../../../shared-types'
import { getTraversedPluginTextNodes } from '../selection'
import { resetText } from './texts'

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

export const setFileConfig = async (config: FileConfig | null) => {
  if (!config) {
    figma.root.setPluginData(FILE_CONFIG_STORAGE_KEY, '')
    return
  }

  figma.root.setPluginData(FILE_CONFIG_STORAGE_KEY, JSON.stringify(config))
}

export const resetFileData = () => {
  const nodes = getTraversedPluginTextNodes()

  nodes.forEach(node => {
    resetText(node)
  })

  setFileConfig(null)
}
