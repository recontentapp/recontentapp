export const resetText = (node: TextNode) => {
  const keys = node.getPluginDataKeys()
  keys.forEach(key => {
    node.setPluginData(key, '')
  })
}
