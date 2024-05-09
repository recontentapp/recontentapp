import { TEXT_ID_KEY } from './storage'

/**
 * Returns directly selected text nodes
 *
 * Text nodes within a selected node of other type are not included
 */
export const getSelectedTextNodes = () => {
  if (figma.currentPage.selection.length === 0) {
    return []
  }

  return figma.currentPage.selection.filter(sceneNode => {
    return sceneNode.type === 'TEXT'
  }) as TextNode[]
}

const traverseForTextNodes = (
  node: SceneNode,
  texts: TextNode[],
  traverseCallback: () => void,
) => {
  if (node.type === 'TEXT') {
    texts.push(node)
  }

  if ('children' in node && node.type !== 'INSTANCE') {
    traverseCallback()
    node.children.forEach(childNode => {
      traverseForTextNodes(childNode, texts, traverseCallback)
    })
  }
}

/**
 * Returns text nodes within selection
 *
 * Nodes with children are traversed recursively
 */
export const getSelectedTraversedTextNodes = () => {
  const texts: TextNode[] = []
  let traversed = false

  figma.currentPage.selection.forEach(node => {
    traverseForTextNodes(node, texts, () => {
      traversed = true
    })
  })

  return { texts, traversed }
}

/**
 * Returns all text nodes that have plugin data
 */
export const getTraversedPluginTextNodes = () => {
  return figma.root.findAll(node => {
    return node.type === 'TEXT' && node.getPluginData(TEXT_ID_KEY).length > 0
  }) as TextNode[]
}

/**
 * Returns all text nodes that have plugin data
 */
export const getTraversedPluginTextNodesWithId = (recontentId: string) => {
  return figma.root.findAll(node => {
    return (
      node.type === 'TEXT' && node.getPluginData(TEXT_ID_KEY) === recontentId
    )
  }) as TextNode[]
}
