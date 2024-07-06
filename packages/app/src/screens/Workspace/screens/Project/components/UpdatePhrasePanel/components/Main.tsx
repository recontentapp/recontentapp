import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  Box,
  Button,
  Heading,
  MinimalButton,
  Stack,
  Text,
  toast,
} from 'design-system'
import { useTranslatePhrase } from '../../../../../../../generated/reactQuery'
import { Components } from '../../../../../../../generated/typeDefinitions'
import { styled } from '../../../../../../../theme'
import {
  EditPhraseKeyModal,
  EditPhraseKeyModalRef,
} from '../../EditPhraseKeyModal'
import { State } from '../types'
import { Form } from './Form'

interface Props {
  project?: Components.Schemas.Project
  phrase?: Components.Schemas.Phrase
  currentIndex: number
  totalCount: number
  onNext: () => void
  onPrevious: () => void
}

const Scroller = styled('div', {
  width: '100%',
  height: '100%',
  paddingX: '$space100',
  overflowY: 'auto',
  overflowX: 'hidden',
})

const Footer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  backgroundColor: '$white',
  borderTop: '1px solid $gray7',
  paddingX: '$space200',
  paddingY: '$space80',
})

export const Main = ({
  project,
  phrase,
  currentIndex,
  totalCount,
  onNext,
  onPrevious,
}: Props) => {
  const editPhraseKeyModalRef = useRef<EditPhraseKeyModalRef>(null!)
  const { mutateAsync: translate, isPending: isTranslating } =
    useTranslatePhrase()
  const [initialState, setInitialState] = useState<State>({})
  const [state, setState] = useState<State>({})

  useEffect(() => {
    if (!phrase) {
      return
    }

    const indexedTranslations = phrase.translations.reduce<
      Record<string, string>
    >((acc, translation) => {
      acc[translation.languageId] = translation.content
      return acc
    }, {})
    const localState = (project?.languages ?? []).reduce<
      Record<string, string | undefined>
    >((acc, language) => {
      acc[language.id] = indexedTranslations[language.id] ?? undefined
      return acc
    }, {})

    setInitialState(localState)
    setState(localState)
  }, [phrase, project?.languages])

  const onSubmit = () => {
    if (isTranslating || !phrase) {
      return
    }

    translate({
      body: {
        phraseId: phrase.id,
        translations: Object.entries(state).map(([localeId, content]) => ({
          languageId: localeId,
          content: content ?? '',
        })),
      },
    })
      .then(() => {
        toast('success', {
          title: 'Phrase translations updated',
        })
      })
      .catch(() => {
        toast('error', {
          title: 'Could not update phrase translations',
        })
      })
  }

  useHotkeys(
    ['metaKey+s', 'ctrl+s'],
    () => {
      onSubmit()
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
    [onSubmit],
  )

  return (
    <>
      <EditPhraseKeyModal ref={editPhraseKeyModalRef} />
      <Box flexGrow={1} height="100%" position="relative">
        <Scroller>
          <Box margin="0 auto" width="100%" maxWidth={700} display="block">
            <Stack direction="column" spacing="$space100" paddingY="$space500">
              <Stack direction="row" alignItems="center" spacing="$space40">
                <Heading size="$size100" color="$gray14" renderAs="h2">
                  {phrase?.key ?? 'Loading key...'}
                </Heading>

                <MinimalButton
                  icon="edit"
                  variation="primary"
                  size="small"
                  onAction={() => {
                    if (!phrase) {
                      return
                    }

                    editPhraseKeyModalRef.current?.open({ phrase })
                  }}
                >
                  Edit key
                </MinimalButton>
              </Stack>

              <Stack
                direction="column"
                spacing="$space200"
                paddingBottom="$space300"
              >
                {(project?.languages ?? []).map((language, index) => (
                  <Form
                    key={index}
                    initialValue={initialState[language.id] ?? ''}
                    index={index}
                    onChange={value =>
                      setState(state => ({
                        ...state,
                        [language.id]: value,
                      }))
                    }
                    language={language}
                    isLoading={!phrase}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>
        </Scroller>

        <Footer>
          <Stack direction="row" alignItems="center" spacing="$space100">
            <Stack direction="row" alignItems="center" spacing="$space40">
              <Button
                variation="secondary"
                icon="keyboard_arrow_up"
                isDisabled={currentIndex === 0}
                onAction={onPrevious}
              />
              <Button
                variation="secondary"
                icon="keyboard_arrow_down"
                isDisabled={currentIndex === totalCount - 1}
                onAction={onNext}
              />
            </Stack>

            <Text size="$size80" color="$gray11">
              {currentIndex + 1} / {totalCount}
            </Text>
          </Stack>

          <Button variation="primary" type="submit" isLoading={isTranslating}>
            Save translations
          </Button>
        </Footer>
      </Box>
    </>
  )
}
