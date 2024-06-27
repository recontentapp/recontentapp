import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  Box,
  Button,
  Heading,
  Sidepanel,
  Stack,
  toast,
  Form as UIForm,
} from 'design-system'
import { SidepanelRef } from 'design-system/dist/components/Sidepanel'
import { useNavigate } from 'react-router-dom'
import {
  useGetPhrase,
  useGetProject,
  useTranslatePhrase,
} from '../../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../../hooks/workspace'
import { Form } from './components/Form'
import { Sidebar } from './components/Sidebar'
import { State } from './types'

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
  const navigate = useNavigate()
  const { key: workspaceKey } = useCurrentWorkspace()
  const { data: project } = useGetProject({ queryParams: { id: projectId } })
  const { data: phrase, isLoading: isLoadingPhrase } = useGetPhrase({
    queryParams: {
      phraseId,
    },
  })
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
      enableOnContentEditable: true,
    },
    [onSubmit],
  )

  return (
    <Stack width="100%" height="100%" direction="row">
      <Stack
        flexGrow={1}
        direction="column"
        alignItems="center"
        paddingX="$space100"
        paddingTop="$space500"
      >
        <Box width="100%" maxWidth={700} display="block">
          <Stack direction="column" spacing="$space100">
            <Heading size="$size100" color="$gray14" renderAs="h2">
              {phrase?.key}
            </Heading>

            <UIForm onSubmit={onSubmit}>
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
                    isLoading={isLoadingPhrase}
                  />
                ))}
              </Stack>

              <Button
                variation="primary"
                type="submit"
                isLoading={isTranslating}
              >
                Save translations
              </Button>
            </UIForm>
          </Stack>
        </Box>
      </Stack>

      <Sidebar project={project} phrase={phrase} />
    </Stack>
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
    const sidepanelRef = useRef<SidepanelRef>(null!)

    useImperativeHandle(ref, () => ({
      open: () => {
        sidepanelRef.current.open()
      },
    }))

    return (
      <Sidepanel ref={sidepanelRef} onClose={onClose}>
        <Content
          projectId={projectId}
          phraseId={phraseId}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </Sidepanel>
    )
  },
)
