const PAGE_LAST_SYNCED_AT_STORAGE_KEY = 'lastSyncedAt'

export const getPageLastSyncedAt = (): number | null => {
  const lastSyncedAt = figma.currentPage.getPluginData(
    PAGE_LAST_SYNCED_AT_STORAGE_KEY,
  )

  if (!lastSyncedAt) {
    return null
  }

  return Number(lastSyncedAt)
}

export const setPageLastSyncedAt = (lastSyncedAt: number) => {
  figma.currentPage.setPluginData(
    PAGE_LAST_SYNCED_AT_STORAGE_KEY,
    String(lastSyncedAt),
  )
}

export const resetPage = (page: PageNode) => {
  const keys = page.getPluginDataKeys()
  keys.forEach(key => {
    page.setPluginData(key, '')
  })
}
