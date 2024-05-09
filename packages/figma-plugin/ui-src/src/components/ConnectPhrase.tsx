import React, { useState } from 'react'
import {
  Box,
  Muted,
  SelectableItem,
  Stack,
  Section,
  Textbox,
} from 'figma-ui-kit'
import {
  PhraseTranslationDTO,
  useConnectPhrase,
  useSearchPhrases,
} from '../api'
import { FigmaText } from '../types'
import { useContext } from '../context'

interface ConnectPhraseProps {
  documentId: string
  text: FigmaText
}

export const ConnectPhrase = ({ documentId, text }: ConnectPhraseProps) => {
  const { emit } = useContext()
  const [searchTerm, setSearchTerm] = useState('')
  const { mutateAsync, isLoading: isConnecting } = useConnectPhrase()
  const { data = [], isLoading: isSearching } = useSearchPhrases({
    documentId,
    term: searchTerm,
  })

  const onRequestConnect = async (phrase: PhraseTranslationDTO) => {
    const result = await mutateAsync({
      document_id: documentId,
      phrase_key: phrase.phrase_key,
    })

    emit({
      type: 'phraseCreated',
      data: {
        recontentId: result.id,
        key: result.phrase_key,
        figmaId: text.figmaId,
      },
    })
  }

  return (
    <Section title="Connect to existing phrase">
      <Stack width="100%" direction="column" spacing="$small">
        <Box flexGrow={1}>
          <Box display="block" width="100%">
            <Textbox
              style={{ width: '100%' }}
              variant="border"
              value={searchTerm}
              onChange={e => setSearchTerm(e.currentTarget.value)}
              placeholder="Search..."
            />
          </Box>
        </Box>

        <Stack
          direction="column"
          spacing="$extraSmall"
          width={300}
          marginLeft={-16}
          marginRight={-16}
        >
          {data.map(phrase => (
            <SelectableItem
              key={phrase.id}
              value={false}
              disabled={isSearching || isConnecting}
              onChange={() => {
                onRequestConnect(phrase)
              }}
            >
              <Stack direction="column">
                {phrase.content}
                <Muted>{phrase.phrase_key}</Muted>
              </Stack>
            </SelectableItem>
          ))}
        </Stack>
      </Stack>
    </Section>
  )
}
