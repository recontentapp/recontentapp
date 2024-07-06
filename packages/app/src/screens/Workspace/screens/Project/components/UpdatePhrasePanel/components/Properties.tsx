import { Box, Spinner, Stack, Tag, Text } from 'design-system'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { formatRelative } from '../../../../../../../utils/dates'
import {
  useReferenceableAccounts,
  useReferenceableTags,
} from '../../../../../hooks/referenceable'

interface Props {
  phrase?: Components.Schemas.Phrase
}

export const Properties = ({ phrase }: Props) => {
  const { getName } = useReferenceableAccounts()
  const { get } = useReferenceableTags(phrase?.projectId)

  if (!phrase) {
    return (
      <Box paddingX="$space80" paddingY="$space200">
        <Spinner size={16} color="$gray11" />
      </Box>
    )
  }

  return (
    <Stack
      paddingX="$space80"
      paddingY="$space200"
      direction="column"
      spacing="$space200"
    >
      <Stack direction="column" spacing="$space60">
        <Text size="$size80" variation="bold" color="$gray14">
          Tags
        </Text>

        <Stack direction="row" spacing="$space20" flexWrap="nowrap">
          {phrase.tags.map(tag => (
            <Tag key={tag} size="small" {...get(tag)} />
          ))}

          {phrase.tags.length === 0 && (
            <Text size="$size60" color="$gray11">
              n/a
            </Text>
          )}
        </Stack>
      </Stack>

      {phrase.updatedBy && (
        <Stack direction="column" spacing="$space60">
          <Text size="$size60" color="$gray11">
            Updated by {getName(phrase.updatedBy)}
          </Text>
          <Text size="$size60" color="$gray11">
            {formatRelative(new Date(phrase.updatedAt))}
          </Text>
        </Stack>
      )}

      <Stack direction="column" spacing="$space60">
        <Text size="$size60" color="$gray11">
          Created by {getName(phrase.createdBy)}
        </Text>
        <Text size="$size60" color="$gray11">
          {formatRelative(new Date(phrase.createdAt))}
        </Text>
      </Stack>
    </Stack>
  )
}
