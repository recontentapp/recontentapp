import {
  Box,
  Button,
  Form,
  Heading,
  MinimalButton,
  Stack,
  TextField,
} from 'design-system'
import { Text } from '../../../../../../../shared-types'
import { useState } from 'react'
import {
  useCreateFigmaFileText,
  useListFigmaFileAvailablePhrases,
} from '../../../../../generated/reactQuery'
import { useBridge } from '../../../../../contexts/Bridge'
import { useDebouncedValue } from '../../../../../hooks/debouncedValue'

interface SingleTextFormProps {
  text: Text
}

const CreatePhrase = ({ text }: SingleTextFormProps) => {
  const [key, setKey] = useState('')
  const { file, emit } = useBridge()
  const { mutateAsync, isPending } = useCreateFigmaFileText({
    onError: () => {
      emit({
        type: 'notification-requested',
        data: {
          message: 'Failed to create phrase',
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
  const { file } = useBridge()
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

  return (
    <Form onSubmit={() => {}}>
      <TextField
        label="Search for a phrase"
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search for a phrase"
      />

      <ul>
        {data?.items.map(i => (
          <li key={i.id}>
            <button>Link to {i.key}</button>
          </li>
        ))}
      </ul>
    </Form>
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
