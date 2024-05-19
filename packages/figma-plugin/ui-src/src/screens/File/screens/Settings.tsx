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
      <Stack direction="column" spacing="$space80">
        <Text size="$size80" color="$gray14">
          Name: {data.name}
        </Text>

        <Text size="$size80" color="$gray14">
          Created {formatRelative(new Date(data.createdAt))}
        </Text>

        <ExternalLink
          fontSize="$size80"
          href={data.inAppUrl}
          title="Recontent.app URL"
        >
          Recontent.app URL
        </ExternalLink>
      </Stack>

      <Box>
        <MinimalButton
          isLoading={isPending}
          icon="unlink"
          variation="danger"
          size="small"
          onAction={onDelete}
        >
          Unlink Figma file
        </MinimalButton>
      </Box>
    </Stack>
  )
}
