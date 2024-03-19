import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { PhraseEditor } from '../../../../../components/PhraseEditor'
import {
  Box,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  toast,
} from '../../../../../components/primitives'
import { isLocaleRTL } from '../../../../../utils/locales'
import {
  useGetPhrase,
  useGetProject,
  useTranslatePhrase,
} from '../../../../../generated/reactQuery'

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
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { data: phrase, isLoading: isLoadingPhrase } = useGetPhrase({
    queryParams: {
      phraseId,
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

  useHotkeys(
    ['metaKey+s', 'ctrl+s'],
    () => {
      onSubmit()
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
    },
    [onSubmit],
  )

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
