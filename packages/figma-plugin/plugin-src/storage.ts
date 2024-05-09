import { getTraversedPluginTextNodes } from './selection'

export const ROOT_PROJECT_KEY = 'recontent'
export const TEXT_ID_KEY = 'id'
export const TEXT_KEY_KEY = 'key'
export const TEXT_CONTENT_KEY = 'content'

const CLIENT_STORAGE_API_TOKEN_KEY = 'apiTokenKey'

export const getAPIToken = async () => {
  const token = await figma.clientStorage.getAsync(CLIENT_STORAGE_API_TOKEN_KEY)
  return token ? String(token) : null
}

export const setAPIToken = async (token: string | null) => {
  if (!token) {
    await figma.clientStorage.deleteAsync(CLIENT_STORAGE_API_TOKEN_KEY)
    return
  }

  await figma.clientStorage.setAsync(CLIENT_STORAGE_API_TOKEN_KEY, token)
}

export const getProjectID = () => {
  const id = figma.root.getPluginData(ROOT_PROJECT_KEY)

  return id ? id : null
}

export const setProjectID = (id: string) => {
  figma.root.setPluginData(ROOT_PROJECT_KEY, id)
}

export const resetNode = (node: TextNode) => {
  const keys = node.getPluginDataKeys()
  keys.forEach(key => {
    node.setPluginData(key, '')
  })
}

/**
 * Remove all plugin data from text nodes
 * & root node
 */
export const resetFile = () => {
  const nodes = getTraversedPluginTextNodes()

  nodes.forEach(node => {
    resetNode(node)
  })

  setProjectID('')
}
