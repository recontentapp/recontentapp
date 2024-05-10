import { $emit, $on } from './io'
import {
  getSelectedTraversedTextNodes,
  getTraversedPluginTextNodes,
  getTraversedPluginTextNodesWithId,
} from './selection'
import {
  getAPIToken,
  getProjectID,
  setProjectID,
  setAPIToken,
  TEXT_ID_KEY,
  TEXT_KEY_KEY,
  TEXT_CONTENT_KEY,
  resetFile,
  resetNode,
} from './storage'
import {
  Receivable,
  Emittable,
  APITokenUpdateRequested,
  NotificationRequested,
  ProjectCreated,
  FigmaText,
  PhraseCreated,
  SyncRequested,
  PhraseUpdated,
  PhraseConnected,
  BatchPhraseCreated,
} from './types'

figma.skipInvisibleInstanceChildren = true
figma.showUI(__html__, { themeColors: true, height: 340 })

const emit = $emit<Emittable>()

console.log('Hello', figma.root.getPluginData('uuid'), figma.currentPage)

const getSelectedTexts = (): {
  selectedTexts: FigmaText[]
  traversed: boolean
} => {
  const { texts, traversed } = getSelectedTraversedTextNodes()
  return {
    selectedTexts: texts.map(text => {
      const id = text.getPluginData(TEXT_ID_KEY)
      const key = text.getPluginData(TEXT_KEY_KEY)
      const content = text.getPluginData(TEXT_CONTENT_KEY)

      return {
        figmaId: text.id,
        content: text.characters,
        recontentId: id.length > 0 ? id : null,
        recontentKey: key.length > 0 ? key : null,
        recontentContent: content.length > 0 ? content : null,
      }
    }),
    traversed,
  }
}

const emitInit = async () => {
  const apiToken = await getAPIToken()
  const { selectedTexts, traversed } = getSelectedTexts()
  emit({
    type: 'initialized',
    data: {
      id: getProjectID(),
      name: figma.root.name,
      apiToken: apiToken ? String(apiToken) : null,
      selectedTexts,
      traversed,
    },
  })
}

$on<Receivable>({
  apiTokenUpdateRequested: async (message: APITokenUpdateRequested) => {
    await setAPIToken(message.data)
    figma.notify('Figma personal token updated')
    await emitInit()
  },
  notificationRequested: (message: NotificationRequested) => {
    const { message: text, error } = message.data
    figma.notify(text, { error })
  },
  projectCreated: async (message: ProjectCreated) => {
    setProjectID(message.data.id)
    await emitInit()
  },
  phraseCreated: (message: PhraseCreated) => {
    const { figmaId, recontentId, key } = message.data
    const node = figma.getNodeById(figmaId) as TextNode | undefined
    if (!node) {
      return
    }

    node.setPluginData(TEXT_ID_KEY, recontentId)
    node.setPluginData(TEXT_CONTENT_KEY, node.characters)
    node.setPluginData(TEXT_KEY_KEY, key)

    figma.notify('Phrase created on Recontent.app')
    emit({
      type: 'textsSelected',
      data: getSelectedTexts(),
    })
  },
  batchPhraseCreated: (message: BatchPhraseCreated) => {
    for (const element of message.data) {
      const { figmaId, recontentId, key } = element
      const node = figma.getNodeById(figmaId) as TextNode | undefined
      if (!node) {
        continue
      }

      node.setPluginData(TEXT_ID_KEY, recontentId)
      node.setPluginData(TEXT_CONTENT_KEY, node.characters)
      node.setPluginData(TEXT_KEY_KEY, key)
    }

    figma.notify('Phrases created on Recontent.app')
    emit({
      type: 'textsSelected',
      data: getSelectedTexts(),
    })
  },
  phraseConnected: (message: PhraseConnected) => {
    const { figmaId, recontentId, key } = message.data
    const node = figma.getNodeById(figmaId) as TextNode | undefined
    if (!node) {
      return
    }

    figma.notify('Text connected to phrase on Recontent.app')
    node.setPluginData(TEXT_ID_KEY, recontentId)
    node.setPluginData(TEXT_CONTENT_KEY, node.characters)
    node.setPluginData(TEXT_KEY_KEY, key)
    emit({
      type: 'textsSelected',
      data: getSelectedTexts(),
    })
  },
  phraseUpdated: async (message: PhraseUpdated) => {
    const { translation, recontentId, key } = message.data

    const nodes = getTraversedPluginTextNodesWithId(recontentId)
    for (const node of nodes) {
      // Fonts need to be loaded before updating text nodes
      await Promise.all(
        node
          .getRangeAllFontNames(0, node.characters.length)
          .map(figma.loadFontAsync),
      ).catch(() => {
        figma.notify('Some fonts are missing', { error: true })
      })

      node.setPluginData(TEXT_KEY_KEY, key)
      node.setPluginData(TEXT_CONTENT_KEY, translation)
      node.characters = translation
    }
    emit({
      type: 'textsSelected',
      data: getSelectedTexts(),
    })
    figma.notify('Phrase pushed to Recontent.app')
  },
  syncRequested: async (message: SyncRequested) => {
    const indexedPhrases = message.data
    const nodes = getTraversedPluginTextNodes()

    let updatedCount = 0
    let detachedCount = 0

    for (const node of nodes) {
      const recontentId = node.getPluginData(TEXT_ID_KEY)

      if (!indexedPhrases[recontentId]) {
        resetNode(node)
        detachedCount += 1
        continue
      }

      // Fonts need to be loaded before updating text nodes
      await Promise.all(
        node
          .getRangeAllFontNames(0, node.characters.length)
          .map(figma.loadFontAsync),
      ).catch(() => {
        figma.notify('Some fonts are missing', { error: true })
      })

      const { translation, key } = indexedPhrases[recontentId]
      node.setPluginData(TEXT_KEY_KEY, key)
      node.setPluginData(TEXT_CONTENT_KEY, translation)
      node.characters = translation
      updatedCount += 1
    }

    figma.notify(
      `Synced from Recontent.app: ${updatedCount} updated texts, ${detachedCount} detached`,
    )
    emit({ type: 'syncDone' })
    emit({
      type: 'textsSelected',
      data: getSelectedTexts(),
    })
  },
  resetRequested: async () => {
    resetFile()
    figma.notify('All content was detached from Recontent.app')
    await emitInit()
  },
})

const init = async () => {
  await emitInit()

  figma.on('selectionchange', () => {
    emit({
      type: 'textsSelected',
      data: getSelectedTexts(),
    })
  })
}

void init()
