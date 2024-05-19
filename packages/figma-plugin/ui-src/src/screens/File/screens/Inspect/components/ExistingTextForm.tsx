import { Box, Button, ExternalLink, Stack, Text } from 'design-system'
import { Text as IText } from '../../../../../../../shared-types'
import { styled } from '../../../../../theme'
import { diffChars } from 'diff'
import { useBridge } from '../../../../../contexts/Bridge'
import {
  useGetFigmaFile,
  useUpdateFigmaFileText,
} from '../../../../../generated/reactQuery'

interface SingleTextFormProps {
  text: IText
}

const Key = styled('span', {
  fontFamily: '$mono',
  fontSize: '$size60',
  paddingY: '$space60',
  paddingX: '$space60',
  borderRadius: '$radius200',
  backgroundColor: '$gray3',
  color: '$gray14',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '$gray4',
  },
})

export const ExistingTextForm = ({ text }: SingleTextFormProps) => {
  const { file, emit } = useBridge()
  const { mutateAsync, isPending: isUpdating } = useUpdateFigmaFileText()
  const { data } = useGetFigmaFile(
    {
      pathParams: {
        id: file.config!.id,
      },
    },
    {
      staleTime: 1000 * 60 * 60,
    },
  )

  const onUpdate = async () => {
    if (!text.app || !file.config) {
      return
    }

    const result = await mutateAsync({
      pathParams: {
        id: file.config.id,
        textId: text.app.id,
      },
      body: {
        content: text.figma.content,
      },
    }).catch(() => null)

    if (!result) {
      return
    }

    emit({
      type: 'texts-sync-received',
      data: {
        items: [result],
      },
    })
  }

  const parts = diffChars(
    text.app?.content ?? text.figma.content,
    text.figma.content,
  )
  const hasDiff = parts.some(part => part.added || part.removed)

  return (
    <Stack
      direction="column"
      spacing="$space200"
      paddingX="$space80"
      paddingY="$space80"
    >
      <Stack direction="column" spacing="$space100">
        <Stack direction="column" spacing="$space60">
          <Text size="$size80" color="$gray14" variation="bold">
            Phrase key
          </Text>
          <Key>{text.app!.phraseKey}</Key>
        </Stack>

        <Stack direction="column" spacing="$space60">
          <Text size="$size80" color="$gray14" variation="bold">
            Content
          </Text>

          <Key>{text.app?.content}</Key>

          {hasDiff && (
            <Text size="$size60" color="$gray11">
              Diff:{' '}
              {parts.map((part, index) => {
                const color = part.added
                  ? '$green100'
                  : part.removed
                    ? '$red100'
                    : '$gray14'

                return (
                  <Text
                    key={index}
                    renderAs="span"
                    size="$size60"
                    color={color}
                  >
                    {part.value}
                  </Text>
                )
              })}
            </Text>
          )}
        </Stack>
      </Stack>

      <Stack direction="column" spacing="$space60">
        <Box>
          <Button
            variation="primary"
            size="small"
            icon="cloud_upload"
            isLoading={isUpdating}
            onAction={onUpdate}
            isDisabled={text.app?.content === text.figma.content}
          >
            Push changes
          </Button>
        </Box>

        {data?.inAppUrl && (
          <ExternalLink
            fontSize="$size60"
            href={`${data.inAppUrl}?key=${text.app?.phraseKey}`}
            title="See on Recontent.app"
          >
            See on Recontent.app
          </ExternalLink>
        )}
      </Stack>
    </Stack>
  )
}
