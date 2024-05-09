import React, { useState } from 'react'
import { Box, IconButton, IconSwap32, Muted, Stack } from 'figma-ui-kit'
import {
  FigmaDocument,
  listPhrasesInFigmaDocument,
  useSyncFigmaDocument,
} from '../api'
import { formatShort } from '../utils/dates'
import { useContext } from '../context'
import { useRequest } from '../request'
import { Receivable, SyncRequested } from '../types'
import { useOn } from '../io'

interface SyncFooterProps {
  document: FigmaDocument
}

export const SyncFooter = ({ document }: SyncFooterProps) => {
  const request = useRequest()
  const [isSyncing, setIsSyncing] = useState(false)
  const { id, emit } = useContext()
  const { mutateAsync: syncFigmaDocument } = useSyncFigmaDocument(id!)

  useOn<Receivable>({
    syncDone: () => {
      syncFigmaDocument(id!)
    },
  })

  const sync = async () => {
    if (isSyncing) {
      return
    }

    setIsSyncing(true)
    try {
      const response = await listPhrasesInFigmaDocument({
        request,
        params: { document_id: id!, limit: 1000 },
      })
      const data = response.data.reduce((acc, item) => {
        acc[item.id] = {
          key: item.phrase_key,
          translation: item.phrase_translation,
        }
        return acc
      }, {} as SyncRequested['data'])
      emit({
        type: 'syncRequested',
        data,
      })
    } catch (e) {
      emit({
        type: 'notificationRequested',
        data: {
          message: 'Error while syncing from Recontent.app',
        },
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Box padding="$extraSmall" display="flex" justifyContent="flex-end">
      <Stack
        direction="row"
        spacing="$extraSmall"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Muted>
          {document.last_synced_at
            ? `Last sync: ${formatShort(new Date(document.last_synced_at))}`
            : 'Last sync: never'}
        </Muted>

        <IconButton onClick={sync} disabled={isSyncing}>
          <IconSwap32 />
        </IconButton>
      </Stack>
    </Box>
  )
}
