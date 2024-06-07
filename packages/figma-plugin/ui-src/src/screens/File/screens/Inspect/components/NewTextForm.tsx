import {
  Box,
  Button,
  Form,
  Heading,
  MinimalButton,
  Stack,
  Text,
  TextField,
} from 'design-system'
import { useState } from 'react'
import { Text as IText } from '../../../../../../../shared-types'
import { useBridge } from '../../../../../contexts/Bridge'
import {
  useCreateFigmaFileText,
  useListFigmaFileAvailablePhrases,
} from '../../../../../generated/reactQuery'
import { useDebouncedValue } from '../../../../../hooks/debouncedValue'
import { isUpsellIssue } from '../../../../../utils/api'

interface SingleTextFormProps {
  text: IText
}

const CreatePhrase = ({ text }: SingleTextFormProps) => {
  const [key, setKey] = useState('')
  const { file, emit } = useBridge()
  const { mutateAsync, isPending } = useCreateFigmaFileText({
    onError: err => {
      if (isUpsellIssue(err)) {
        emit({
          type: 'notification-requested',
          data: {
            message:
              "You've reached the limits of your current Recontent.app plan.",
          },
        })
        return
      }

      emit({
        type: 'notification-requested',
        data: {
          message: 'Could not create phrase, key might be taken.',
          type: 'error',
        },
      })
    },
  })

  const onSubmit = async () => {
    const result = await mutateAsync({
      pathParams: {
        id: file.config!.id,
      },
      body: {
        items: [
          {
            phraseKey: key || null,
            content: text.figma.content,
            textNodeId: text.figma.nodeId,
            pageNodeId: text.figma.pageNodeId,
          },
        ],
      },
    }).catch(() => null)

    if (!result) {
      return
    }

    emit({
      type: 'texts-sync-received',
      data: {
        items: result.items,
        type: 'partial',
      },
    })
  }

  return (
    <Form onSubmit={onSubmit}>
      <Stack direction="column" spacing="$space80">
        <TextField
          label="Choose a key"
          isOptional
          value={key}
          onChange={setKey}
          placeholder="dashboard.title"
        />

        <Box>
          <Button type="submit" isLoading={isPending} variation="primary">
            Create phrase
          </Button>
        </Box>
      </Stack>
    </Form>
  )
}

const ConnectToPhrase = ({ text }: SingleTextFormProps) => {
  const { file, emit } = useBridge()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500)
  const { data } = useListFigmaFileAvailablePhrases(
    {
      pathParams: {
        id: file.config!.id,
      },
      queryParams: {
        query: debouncedSearchTerm ?? '',
      },
    },
    {
      enabled: debouncedSearchTerm.length > 2,
    },
  )

  const { mutateAsync } = useCreateFigmaFileText({
    onError: () => {
      emit({
        type: 'notification-requested',
        data: {
          message: 'Failed to connect phrase',
          type: 'error',
        },
      })
    },
  })

  const onSubmit = async (phraseId: string) => {
    const result = await mutateAsync({
      pathParams: {
        id: file.config!.id,
      },
      body: {
        items: [
          {
            phraseId,
            textNodeId: text.figma.nodeId,
            pageNodeId: text.figma.pageNodeId,
          },
        ],
      },
    }).catch(() => null)

    if (!result) {
      return
    }

    emit({
      type: 'texts-sync-received',
      data: {
        items: result.items,
        type: 'partial',
      },
    })
  }

  return (
    <Stack direction="column" spacing="$space100">
      <TextField
        label="Search for a phrase"
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search for a phrase"
      />

      {data && (
        <Stack width="100%" direction="column" spacing="$space20">
          {data.items.map(item => (
            <Stack
              width="100%"
              key={item.id}
              direction="row"
              alignItems="center"
              spacing="$space0"
              flexWrap="nowrap"
            >
              <Box flexGrow={1}>
                <Stack direction="column" spacing="$space20">
                  {item.content && (
                    <Text size="$size80" color="$gray14" variation="bold">
                      <span
                        title={item.content}
                        style={{
                          display: 'block',
                          maxWidth: 280,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.content}
                      </span>
                    </Text>
                  )}
                  <Text
                    size={item.content ? '$size60' : '$size80'}
                    color={item.content ? '$gray11' : '$gray14'}
                  >
                    <span
                      style={{
                        display: 'block',
                        maxWidth: 280,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.key}
                    </span>
                  </Text>
                </Stack>
              </Box>

              <div style={{ flexShrink: 0 }}>
                <MinimalButton
                  icon="link"
                  size="xsmall"
                  onAction={() => onSubmit(item.id)}
                >
                  Link
                </MinimalButton>
              </div>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export const NewTextForm = ({ text }: SingleTextFormProps) => {
  const [creating, setCreating] = useState(true)

  return (
    <Stack
      direction="column"
      paddingX="$space80"
      paddingY="$space80"
      spacing="$space100"
    >
      <Stack
        direction="row"
        spacing="$space40"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading renderAs="h1" size="$size100">
          "{text.figma.content}"
        </Heading>

        <MinimalButton
          variation="primary"
          icon={creating ? 'link' : 'add'}
          size="xsmall"
          onAction={() => setCreating(creating => !creating)}
        >
          {creating ? 'Link to phrase instead' : 'Create phrase instead'}
        </MinimalButton>
      </Stack>

      {creating ? (
        <CreatePhrase text={text} />
      ) : (
        <ConnectToPhrase text={text} />
      )}
    </Stack>
  )
}
