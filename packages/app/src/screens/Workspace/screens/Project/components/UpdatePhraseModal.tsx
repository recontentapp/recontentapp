import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  Tooltip,
  toast,
} from 'design-system'
import { PhraseEditor } from '../../../../../components/PhraseEditor'
import {
  getGetPhraseQueryKey,
  useAutoTranslatePhrase,
  useGetPhrase,
  useGetProject,
  useTranslatePhrase,
} from '../../../../../generated/reactQuery'
import { useHasAbility } from '../../../../../hooks/workspace'
import { isLocaleRTL } from '../../../../../utils/locales'

export interface UpdatePhraseModalRef {
  open: () => void
}

interface UpdatePhraseModalProps {
  projectId: string
  revisionId: string
  phraseId: string
  hasNext: boolean
  hasPrevious: boolean
  onNext: () => void
  onPrevious: () => void
  onClose?: () => void
}

interface ContentProps {
  projectId: string
  phraseId: string
  hasNext: boolean
  hasPrevious: boolean
  onNext: () => void
  onPrevious: () => void
}

const Content: FC<ContentProps> = ({
  projectId,
  phraseId,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
}) => {
  const queryClient = useQueryClient()
  const hasAutoTranslate = useHasAbility('auto_translation:use')
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { data: phrase, isLoading: isLoadingPhrase } = useGetPhrase({
    queryParams: {
      phraseId,
    },
  })
  const { mutateAsync: autoTranslate, isPending: isAutoTranslating } =
    useAutoTranslatePhrase({
      onSuccess: data => {
        queryClient.setQueryData(
          getGetPhraseQueryKey({ queryParams: { phraseId } }),
          data,
        )
      },
    })
  const { mutateAsync: translate, isPending: isTranslating } =
    useTranslatePhrase()
  const [initialState, setInitialState] = useState<
    Record<string, string | undefined>
  >({})
  const [state, setState] = useState<Record<string, string | undefined>>({})

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
    if (isTranslating || isLoadingPhrase) {
      return
    }

    translate({
      body: {
        phraseId,
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

  const onAutoTranslate = useCallback(
    (languageId: string) => {
      if (isAutoTranslating) {
        return
      }

      autoTranslate({ body: { phraseId, languageId } })
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
    [phraseId, isAutoTranslating, autoTranslate],
  )

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

  const singleTranslationId =
    phrase?.translations.length === 1
      ? phrase?.translations[0].languageId
      : undefined
  const hasAtLeastOneTranslation = (phrase?.translations ?? []).length > 0
  const showAutoTranslate = hasAutoTranslate && hasAtLeastOneTranslation

  return (
    <ModalContent
      asForm
      contextTitle={phrase?.key ?? 'Loading...'}
      title="Update translations"
      primaryAction={{
        label: 'Save translations',
        isLoading: isTranslating,
        onAction: onSubmit,
      }}
      footer={{
        moveDown: {
          isDisabled: !hasNext,
          onAction: onNext,
        },
        moveUp: {
          isDisabled: !hasPrevious,
          onAction: onPrevious,
        },
      }}
    >
      <Stack direction="column" spacing="$space100" paddingBottom="$space300">
        {(project?.languages ?? []).map((language, index) => {
          const isRTL = isLocaleRTL(language.locale)
          const isSingleTranslation = singleTranslationId === language.id

          return (
            <Stack
              width="100%"
              direction="row"
              spacing="$space80"
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
                  isDisabled={isLoadingPhrase}
                  initialValue={initialState[language.id] ?? ''}
                  onChange={value =>
                    setState(state => ({
                      ...state,
                      [language.id]: value,
                    }))
                  }
                />
              </Box>
              {showAutoTranslate && (
                <Box display="block" paddingTop="$space200">
                  <Tooltip title="Autotranslate" position="top" wrap>
                    <Button
                      variation="secondary"
                      icon="translate"
                      isDisabled={isSingleTranslation}
                      isLoading={isAutoTranslating}
                      onAction={() => onAutoTranslate(language.id)}
                    />
                  </Tooltip>
                </Box>
              )}
            </Stack>
          )
        })}
      </Stack>
    </ModalContent>
  )
}

export const UpdatePhraseModal = forwardRef<
  UpdatePhraseModalRef,
  UpdatePhraseModalProps
>(
  (
    { onClose, phraseId, projectId, hasNext, hasPrevious, onNext, onPrevious },
    ref,
  ) => {
    const modalRef = useRef<ModalRef>(null!)

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current.open()
      },
    }))

    return (
      <Modal ref={modalRef} onClose={onClose}>
        <Content
          projectId={projectId}
          phraseId={phraseId}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </Modal>
    )
  },
)
