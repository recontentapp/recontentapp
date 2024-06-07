import {
  Box,
  Button,
  ExternalLink,
  MinimalButton,
  Stack,
  Text,
} from 'design-system'
import { FullpageSpinner } from '../../../../../components/FullpageSpinner'
import { useBridge } from '../../../../../contexts/Bridge'
import { useDeleteFigmaFile } from '../../../../../generated/reactQuery'
import { formatRelative } from '../../../../../utils/dates'
import { useFile } from '../../../hooks'

interface DetailsProps {
  onRequestLanguageChange: () => void
}

export const Details = ({ onRequestLanguageChange }: DetailsProps) => {
  const { file, emit } = useBridge()
  const { data } = useFile()
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
      spacing="$space300"
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
            Project
          </Text>

          <ExternalLink
            fontSize="$size80"
            href={data.inAppUrl}
            title="Recontent.app URL"
          >
            {data.projectName}
          </ExternalLink>
        </Stack>

        <Stack direction="column" spacing="$space60">
          <Text size="$size80" color="$gray14" variation="bold">
            Language
          </Text>

          <Stack direction="row" spacing="$space60" alignItems="center">
            <Text size="$size80" color="$gray14">
              {data.languageName}
            </Text>

            <MinimalButton
              onAction={onRequestLanguageChange}
              variation="primary"
              icon="edit"
              size="xsmall"
            >
              Change
            </MinimalButton>
          </Stack>
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

      <Box>
        <Button
          isLoading={isPending}
          icon="unlink"
          variation="danger"
          size="xsmall"
          onAction={onDelete}
        >
          Unlink Figma file
        </Button>
      </Box>
    </Stack>
  )
}
