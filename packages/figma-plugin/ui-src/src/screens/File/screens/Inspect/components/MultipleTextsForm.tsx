import {
  Stack,
  TextField,
  Text,
  MinimalButton,
  Box,
  Button,
} from 'design-system'
import { Text as IText } from '../../../../../../../shared-types'
import { useEffect, useState } from 'react'
import { useCreateFigmaFileText } from '../../../../../generated/reactQuery'
import { useBridge } from '../../../../../contexts/Bridge'
import { chunkArray } from '../../../../../utils/arrays'
import { processPromisesInBatches } from '../../../../../utils/promises'

interface SingleTextFormProps {
  texts: IText[]
}

const isNew = (text: IText) => text.app === null

export const MultipleTextsForm = ({ texts }: SingleTextFormProps) => {
  const { file, emit } = useBridge()
  const { mutateAsync, isPending } = useCreateFigmaFileText({
    onError: () => {
      emit({
        type: 'notification-requested',
        data: {
          message: 'Could not create texts.',
          type: 'error',
        },
      })
    },
  })
  const [prefix, setPrefix] = useState('')
  const [newTexts, setNewTexts] = useState(texts.filter(isNew))
  const notSyncedTexts = texts.filter(isNew)

  useEffect(() => {
    setNewTexts(texts.filter(isNew))
  }, [texts])

  const onSubmit = async () => {
    if (isPending || !file.config) {
      return
    }

    const items = newTexts.map(text => ({
      phraseKey:
        prefix.length > 0
          ? `${prefix}_${new Date().getTime()}${Math.floor(Math.random() * 1000)}`
          : null,
      content: text.figma.content,
      textNodeId: text.figma.nodeId,
      pageNodeId: text.figma.pageNodeId,
    }))

    const chunks = chunkArray(items, 100)

    const result = await processPromisesInBatches(
      chunks.map(chunk =>
        mutateAsync({
          pathParams: {
            id: file.config!.id,
          },
          body: {
            items: chunk,
          },
        }).catch(() => null),
      ),
      2,
    )

    const resultItems = result
      .map(r => {
        if (r.status !== 'fulfilled' || !r.value?.items) {
          return []
        }

        return r.value.items
      })
      .flat()

    emit({
      type: 'texts-sync-received',
      data: {
        items: resultItems,
      },
    })
  }

  return (
    <Stack
      width="100%"
      direction="column"
      spacing="$space100"
      paddingX="$space80"
      paddingY="$space80"
    >
      <Text size="$size80" color="$gray14">
        {texts.length} texts selected, {notSyncedTexts.length} out of which are
        not synced.
      </Text>

      {newTexts.length > 0 && (
        <Stack width="100%" direction="column" spacing="$space20">
          {newTexts.map((text, index) => (
            <Stack
              width="100%"
              key={text.figma.nodeId}
              direction="row"
              alignItems="center"
              spacing="$space0"
            >
              <Box flexGrow={1}>
                <Text size="$size80" color="$gray14" variation="bold">
                  {text.figma.content}
                </Text>
              </Box>

              <MinimalButton
                icon="delete"
                size="xsmall"
                onAction={() => {
                  setNewTexts(localTexts => {
                    const copy = [...localTexts]
                    copy.splice(index, 1)
                    return copy
                  })
                }}
              />
            </Stack>
          ))}
        </Stack>
      )}

      <Stack direction="row" alignItems="center" spacing="$space60">
        <TextField
          hideLabel
          label="Prefix"
          value={prefix}
          placeholder="Optional key prefix"
          onChange={setPrefix}
        />

        <Button
          isDisabled={newTexts.length === 0}
          size="small"
          icon="cloud_upload"
          variation="primary"
          isLoading={isPending}
          onAction={onSubmit}
        >
          Push {newTexts.length} texts
        </Button>
      </Stack>
    </Stack>
  )
}
