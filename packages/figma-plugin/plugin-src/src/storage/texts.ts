import { Text } from '../../../shared-types'

const APP_ID = 'id'
const APP_PHRASE_ID = 'phraseId'
const APP_PHRASE_KEY = 'phraseKey'
const APP_CONTENT = 'content'
const APP_LAST_SYNCED_AT = 'appLastSyncedAt'

export const getTextData = (node: TextNode): Text => {
  const id = node.getPluginData(APP_ID)
  const phraseId = node.getPluginData(APP_PHRASE_ID)
  const phraseKey = node.getPluginData(APP_PHRASE_KEY)
  const content = node.getPluginData(APP_CONTENT)
  const lastSyncedAt = node.getPluginData(APP_LAST_SYNCED_AT)

  const app =
    id && phraseId && phraseKey
      ? {
          id,
          phraseId,
          phraseKey,
          content: content || null,
        }
      : null

  const appLastSyncedAt = lastSyncedAt ? Number(lastSyncedAt) : null

  return {
    figma: {
      pageNodeId: figma.currentPage.id,
      nodeId: node.id,
      content: node.characters,
    },
    app,
    appLastSyncedAt,
  }
}

export const resetText = (node: TextNode) => {
  const keys = node.getPluginDataKeys()
  keys.forEach(key => {
    node.setPluginData(key, '')
  })
}
