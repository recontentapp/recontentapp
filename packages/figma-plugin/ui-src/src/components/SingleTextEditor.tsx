import React, { useState } from 'react'
import {
  Bold,
  Box,
  Button,
  Stack,
  Text,
  Textbox,
  Section,
  PropertiesSection,
} from 'figma-ui-kit'
import { diffChars } from 'diff'
import { FigmaText } from '../types'

import {
  FigmaDocument,
  useCreatePhrase,
  useUpdatePhraseForDocument,
} from '../api'
import { useContext } from '../context'
import { styled } from '../theme'
import { ConnectPhrase } from './ConnectPhrase'

interface SingleTextEditorProps {
  text: FigmaText
  document?: FigmaDocument
}

const Border = styled('div', {
  flexGrow: 1,
  height: 1,
  border: 'none',
  backgroundColor: 'var(--figma-color-border)',
})

export const SingleTextEditor = ({ text, document }: SingleTextEditorProps) => {
  const [isSearching, setIsSearching] = useState(false)
  const { id, emit } = useContext()
  const { mutateAsync: updatePhraseForDocument, isLoading: isUpdatingPhrase } =
    useUpdatePhraseForDocument()
  const { mutateAsync: createPhrase, isLoading: isCreatingPhrase } =
    useCreatePhrase()
  const [key, setKey] = useState('')
  const parts = diffChars(text.recontentContent ?? text.content, text.content)

  const requestUpdatePhraseForDocument = async (
    phraseId: string,
    content: string,
  ) => {
    const result = await updatePhraseForDocument({
      document_id: id!,
      phrase_content: content,

      id: phraseId,
    })

    emit({
      type: 'phraseUpdated',
      data: {
        recontentId: result.id,
        translation: result.phrase_translation,
        key: result.phrase_key,
      },
    })
  }

  const onRequestCreatePhrase = async (content: string, figmaId: string) => {
    const result = await createPhrase({
      document_id: id!,
      phrase_content: content,
      phrase_key: key.length > 0 ? key : undefined,
    })

    emit({
      type: 'phraseCreated',
      data: {
        recontentId: result.id,
        key: result.phrase_key,
        figmaId,
      },
    })
  }

  const isDiff =
    text.recontentContent !== null && text.recontentContent !== text.content

  return (
    <Stack direction="column">
      {text.recontentKey && (
        <PropertiesSection
          properties={[
            {
              label: 'Key',
              value: text.recontentKey,
            },
            ...(document
              ? [
                  {
                    label: 'Link',
                    value: 'Recontent.app editor',
                    href: `${document.url}?key=${text.recontentKey}`,
                  },
                ]
              : []),
          ]}
        />
      )}

      {parts.length > 1 && (
        <Section title="Content">
          {parts.map((part, index) => {
            const color = part.added
              ? 'var(--figma-color-text-success)'
              : part.removed
              ? 'var(--figma-color-text-danger)'
              : undefined

            return (
              <Text
                key={index}
                style={{
                  color,
                  textDecoration: part.removed ? 'line-through' : undefined,
                }}
              >
                {part.value}
              </Text>
            )
          })}
        </Section>
      )}

      {isDiff && (
        <Box paddingX="$medium" paddingY="$large">
          <Button
            fullWidth
            secondary
            loading={isUpdatingPhrase}
            onClick={() =>
              requestUpdatePhraseForDocument(text.recontentId!, text.content)
            }
          >
            Push update
          </Button>
        </Box>
      )}

      {text.recontentContent === null && !isSearching && (
        <Stack
          direction="column"
          width="100%"
          spacing="$small"
          paddingX="$medium"
          paddingY="$medium"
        >
          <Stack direction="row" spacing="$extraSmall" alignItems="center">
            <Box flexGrow={1}>
              <Box display="block" width="100%">
                <Textbox
                  style={{ width: '100%' }}
                  variant="border"
                  value={key}
                  onChange={e => setKey(e.currentTarget.value)}
                  placeholder="Optionnally choose a key"
                />
              </Box>
            </Box>

            <Button
              onClick={() => onRequestCreatePhrase(text.content, text.figmaId)}
              loading={isCreatingPhrase}
            >
              Push phrase
            </Button>
          </Stack>

          <Stack direction="row" spacing="$extraSmall" alignItems="center">
            <Border />
            <Bold style={{ fontSize: 10 }}>OR</Bold>
            <Border />
          </Stack>

          <Button secondary fullWidth onClick={() => setIsSearching(true)}>
            Connect to existing phrase
          </Button>
        </Stack>
      )}

      {text.recontentContent === null && document && isSearching && (
        <ConnectPhrase documentId={document.id} text={text} />
      )}
    </Stack>
  )
}
