import { useQueryClient } from '@tanstack/react-query'
import { Box, Button, Stack, toast } from 'design-system'
import { useCallback } from 'react'
import { PhraseEditor } from '../../../../../../../components/PhraseEditor'
import {
  getGetPhraseQueryKey,
  useAutoTranslatePhrase,
  useRewritePhraseTranslation,
} from '../../../../../../../generated/reactQuery'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { isLocaleRTL } from '../../../../../../../utils/locales'

interface Props {
  initialValue: string
  index: number
  onChange: (value: string) => void
  language: Components.Schemas.Language
  phrase?: Components.Schemas.Phrase
  autoTranslationAvailable: boolean
  isLoading: boolean
}

export const Form = ({
  initialValue,
  onChange,
  isLoading,
  autoTranslationAvailable,
  index,
  language,
  phrase,
}: Props) => {
  const queryClient = useQueryClient()
  const { mutateAsync: rewrite } = useRewritePhraseTranslation()
  const { mutateAsync: autoTranslate, isPending: isAutoTranslating } =
    useAutoTranslatePhrase({
      onSuccess: data => {
        if (!phrase) {
          return
        }

        queryClient.setQueryData(
          getGetPhraseQueryKey({ queryParams: { phraseId: phrase.id } }),
          data,
        )
      },
    })
  const isRTL = isLocaleRTL(language.locale)

  const onAutoTranslate = useCallback(
    (languageId: string) => {
      if (isAutoTranslating || !phrase) {
        return
      }

      autoTranslate({ body: { phraseId: phrase.id, languageId } })
        .then(() => {
          toast('success', {
            title: 'Phrase autotranslated',
          })
        })
        .catch(() => {
          toast('error', {
            title: 'Could not autotranslate phrase',
          })
        })
    },
    [phrase, isAutoTranslating, autoTranslate],
  )

  return (
    <Stack
      width="100%"
      direction="row"
      spacing="$space60"
      alignItems="flex-start"
      key={language.id}
    >
      <Box
        flexGrow={1}
        testId={index === 0 ? 'phrase-modal-first-field' : undefined}
      >
        <PhraseEditor
          autoFocus={index === 0}
          width="100%"
          direction={isRTL ? 'rtl' : 'ltr'}
          label={language.name}
          placeholder="Translation content"
          isDisabled={isLoading}
          initialValue={initialValue}
          onChange={onChange}
        />
      </Box>

      <Stack direction="row" spacing="$space60">
        <Button
          variation="secondary"
          size="xsmall"
          icon="sparkles"
          onAction={() => {
            const translation = phrase?.translations.find(
              t => t.languageId === language.id,
            )
            if (!translation) {
              return
            }
            rewrite({
              body: {
                phraseTranslationId: translation.id,
                tone: 'informal',
                length: 'same',
                customInstructions: [],
              },
            })
          }}
        >
          Rewrite
        </Button>

        {autoTranslationAvailable && (
          <Button
            variation="secondary"
            icon="translate"
            size="xsmall"
            isLoading={isAutoTranslating}
            onAction={() => onAutoTranslate(language.id)}
          >
            Autotranslate
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
