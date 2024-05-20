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
