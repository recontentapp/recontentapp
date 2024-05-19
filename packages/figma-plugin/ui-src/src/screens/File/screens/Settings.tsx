import { Box, ExternalLink, MinimalButton, Stack, Text } from 'design-system'
import {
  useDeleteFigmaFile,
  useGetFigmaFile,
} from '../../../generated/reactQuery'
import { useBridge } from '../../../contexts/Bridge'
import { FullpageSpinner } from '../../../components/FullpageSpinner'
import { formatRelative } from '../../../utils/dates'

export const Settings = () => {
  const { file, emit } = useBridge()
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
  const { mutateAsync, isPending } = useDeleteFigmaFile()

  const onDelete = () => {
    mutateAsync({
      pathParams: {
        id: file.config!.id,
      },
    }).finally(() => {
      emit({
        type: 'file-config-reset-requested',
      })
      emit({
        type: 'notification-requested',
        data: {
          message: 'Figma file unlinked',
        },
      })
    })
  }

  if (!data) {
    return <FullpageSpinner />
  }

  return (
    <Stack
      direction="column"
      spacing="$space100"
      paddingX="$space80"
      paddingY="$space80"
    >
      <Stack direction="column" spacing="$space100">
        <Stack direction="column" spacing="$space60">
          <Text size="$size80" color="$gray14" variation="bold">
            Name
          </Text>
          <Text size="$size80" color="$gray14">
            {data.name}
          </Text>
        </Stack>

        <Stack direction="column" spacing="$space60">
          <Text size="$size80" color="$gray14" variation="bold">
            Creation date
          </Text>
          <Text size="$size80" color="$gray14">
            {formatRelative(new Date(data.createdAt))}
          </Text>
        </Stack>
      </Stack>

      <Stack direction="column" spacing="$space80">
        <ExternalLink
          fontSize="$size60"
          href={data.inAppUrl}
          title="Recontent.app URL"
        >
          Recontent.app URL
        </ExternalLink>

        <div style={{ marginLeft: -8 }}>
          <MinimalButton
            isLoading={isPending}
            icon="unlink"
            variation="danger"
            size="small"
            onAction={onDelete}
          >
            Unlink Figma file
          </MinimalButton>
        </div>
      </Stack>
    </Stack>
  )
}
