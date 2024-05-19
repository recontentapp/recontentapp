import { useState } from 'react'
import { useBridge } from '../../contexts/Bridge'
import { useAPIClient } from '../../generated/reactQuery'
import { Components } from '../../generated/typeDefinitions'

export const useSync = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { file, currentPage, emit } = useBridge()
  const apiClient = useAPIClient()

  const sync = async () => {
    if (!file.config) {
      return
    }

    setIsLoading(true)
    let currentRequestPage = 1
    let done = false
    const items: Components.Schemas.FigmaText[] = []

    while (!done) {
      const res = await apiClient.listFigmaFileTexts({
        pathParams: {
          id: file.config.id,
        },
        queryParams: {
          pageNodeId: currentPage.nodeId,
          page: currentRequestPage,
        },
      })

      if (!res.ok) {
        done = true
        return
      }

      if (currentRequestPage >= res.data.pagination.pagesCount) {
        done = true
      }

      currentRequestPage++
      items.push(...res.data.items)
    }

    setIsLoading(false)

    emit({
      type: 'texts-sync-received',
      data: {
        items,
        type: 'complete',
      },
    })
    emit({
      type: 'notification-requested',
      data: {
        message: 'Synced successfully',
      },
    })
  }

  return {
    sync,
    isLoading,
  }
}
