import { Text, TextSync } from '../../../shared-types'

export const APP_ID = 'id'
const APP_PHRASE_ID = 'phraseId'
const APP_PHRASE_KEY = 'phraseKey'
const APP_CONTENT = 'content'

export const syncTextData = async (data: TextSync) => {
  const node = await figma.getNodeByIdAsync(data.textNodeId)

  if (!node || node.type !== 'TEXT') {
    return
  }

  node.setPluginData(APP_ID, data.id)
  node.setPluginData(APP_PHRASE_ID, data.phraseId)
  node.setPluginData(APP_PHRASE_KEY, data.phraseKey)

  const newContent = data.content || data.phraseKey
  node.setPluginData(APP_CONTENT, data.content || '')

  if (!node.hasMissingFont) {
    // https://forum.figma.com/t/error-cannot-unwrap-symbol/36692
    try {
      // TODO: Investigate potential performance issues
      await figma.loadFontAsync(node.fontName as FontName)
      node.characters = newContent
    } catch (e) {
      // Do nothing
    }
  }
}

export const getTextData = (node: TextNode): Text => {
  const id = node.getPluginData(APP_ID)
  const phraseId = node.getPluginData(APP_PHRASE_ID)
  const phraseKey = node.getPluginData(APP_PHRASE_KEY)
  const content = node.getPluginData(APP_CONTENT)

  const app =
    id && phraseId && phraseKey
      ? {
          id,
          phraseId,
          phraseKey,
          content: content || null,
        }
      : null

  return {
    figma: {
      pageNodeId: figma.currentPage.id,
      nodeId: node.id,
      content: node.characters,
    },
    app,
  }
}

export const resetText = (node: TextNode) => {
  const keys = node.getPluginDataKeys()
  keys.forEach(key => {
    node.setPluginData(key, '')
  })
}
