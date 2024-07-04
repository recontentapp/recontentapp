import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Heading,
  Modal,
  ModalContent,
  ModalRef,
  Stack,
  Switch,
  TextField,
  toast,
} from 'design-system'
import {
  getListGlossaryTermsQueryKey,
  useCreateGlossaryTerm,
  useDeleteGlossaryTerm,
  useListWorkspaceLanguages,
  useUpdateGlossaryTerm,
} from '../../../../../generated/reactQuery'
import { Components } from '../../../../../generated/typeDefinitions'

export interface UpsertGlossaryTermModalRef {
  open: (
    glossary: Components.Schemas.Glossary,
    term: Components.Schemas.GlossaryTerm | null,
  ) => void
  close: () => void
}

interface ContentProps {
  glossary: Components.Schemas.Glossary
  term: Components.Schemas.GlossaryTerm | null
  close: () => void
}

interface State {
  name: string
  description: string | null
  forbidden: boolean
  caseSensitive: boolean
  nonTranslatable: boolean
  translations: {
    languageId: string
    content: string
  }[]
}

const Content: FC<ContentProps> = ({ glossary, term, close }) => {
  const queryClient = useQueryClient()
  const { data } = useListWorkspaceLanguages({
    queryParams: {
      workspaceId: glossary.workspaceId,
    },
  })
  const [state, setState] = useState<State>({
    name: term?.name ?? '',
    description: term?.description ?? '',
    forbidden: term?.forbidden ?? false,
    caseSensitive: term?.caseSensitive ?? false,
    nonTranslatable: term?.nonTranslatable ?? false,
    translations: term?.translations ?? [],
  })

  const languagesMap = useMemo(() => {
    if (!data) {
      return {}
    }

    return data.reduce<Record<string, Components.Schemas.Language>>(
      (acc, language) => {
        acc[language.id] = language
        return acc
      },
      {},
    )
  }, [data])

  useEffect(() => {
    if (!data || state.nonTranslatable || state.forbidden) {
      return
    }

    setState(prevState => {
      const newState = { ...prevState }

      data.forEach(language => {
        if (
          !newState.translations.some(
            translation => translation.languageId === language.id,
          )
        ) {
          newState.translations.push({
            languageId: language.id,
            content: '',
          })
        }
      })

      return newState
    })
  }, [data, state.nonTranslatable, state.forbidden])
  const containsTranslations =
    state.translations.length > 0 &&
    state.translations.some(translation => !!translation.content)
  const isStateValid =
    !!state.name &&
    ((state.nonTranslatable && !containsTranslations) ||
      (!state.nonTranslatable && containsTranslations))

  const { mutateAsync: create, isPending: isCreating } = useCreateGlossaryTerm({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListGlossaryTermsQueryKey({
          queryParams: {
            glossaryId: glossary.id,
          },
        }),
      })
    },
  })
  const { mutateAsync: update, isPending: isUpdating } = useUpdateGlossaryTerm({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListGlossaryTermsQueryKey({
          queryParams: {
            glossaryId: glossary.id,
          },
        }),
      })
    },
  })
  const { mutateAsync: deleteTerm, isPending: isDeleting } =
    useDeleteGlossaryTerm({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListGlossaryTermsQueryKey({
            queryParams: {
              glossaryId: glossary.id,
            },
          }),
        })
      },
    })
  const isLoading = isCreating || isUpdating || isDeleting

  const requestDelete = () => {
    if (!term) {
      return
    }

    deleteTerm({ body: { id: term.id } })
      .then(() => {
        close()
        toast('success', { title: 'Glossary term deleted' })
      })
      .catch(() => {
        toast('error', { title: 'Failed to delete glossary term' })
      })
  }

  const onSubmit = () => {
    if (!isStateValid || isLoading) {
      return
    }

    if (term) {
      update({
        body: {
          id: term.id,
          name: state.name,
          description: state.description ?? null,
          forbidden: state.forbidden,
          caseSensitive: state.caseSensitive,
          nonTranslatable: state.nonTranslatable,
          translations: state.translations.filter(t => !!t.content),
        },
      }).then(() => {
        close()
        toast('success', {
          title: 'Term updated successfully',
        })
      })
      return
    }

    create({
      body: {
        glossaryId: glossary.id,
        name: state.name,
        description: state.description ?? null,
        forbidden: state.forbidden,
        caseSensitive: state.caseSensitive,
        nonTranslatable: state.nonTranslatable,
        translations: state.translations.filter(t => !!t.content),
      },
    }).then(() => {
      close()
      toast('success', {
        title: 'Term created successfully',
      })
    })
  }

  useEffect(() => {
    if (
      (state.forbidden || state.nonTranslatable) &&
      state.translations.length > 0
    ) {
      setState(state => ({
        ...state,
        translations: [],
      }))
    }
  }, [state.forbidden, state.nonTranslatable, state.translations.length])

  return (
    <ModalContent
      asForm
      contextTitle={glossary.name}
      title={term ? 'Update term' : 'Create term'}
      primaryAction={{
        label: 'Save term',
        isLoading: isCreating,
        onAction: onSubmit,
        isDisabled: !isStateValid,
      }}
      secondaryAction={
        term
          ? {
              label: 'Delete term',
              variation: 'danger',
              isLoading: isDeleting,
              onAction: requestDelete,
            }
          : undefined
      }
    >
      <Stack direction="column" spacing="$space100" paddingBottom="$space300">
        <TextField
          autoFocus
          label="Name"
          value={state.name}
          placeholder="Enter a term name..."
          onChange={name =>
            setState(state => ({
              ...state,
              name,
            }))
          }
        />

        <TextField
          label="Description"
          value={state.description ?? ''}
          placeholder="Enter a description..."
          onChange={description =>
            setState(state => ({
              ...state,
              description,
            }))
          }
        />

        <Stack direction="column" spacing="$space80">
          <Switch
            label="Case sensitive"
            value={state.caseSensitive}
            onChange={caseSensitive => {
              setState(state => ({
                ...state,
                caseSensitive,
              }))
            }}
          />

          <Switch
            label="Forbidden"
            value={state.forbidden}
            onChange={forbidden => {
              setState(state => ({
                ...state,
                forbidden,
              }))
            }}
          />

          <Switch
            label="Non-translatable"
            value={state.nonTranslatable}
            onChange={nonTranslatable => {
              setState(state => ({
                ...state,
                nonTranslatable,
              }))
            }}
          />
        </Stack>

        {state.translations.length > 0 && (
          <Stack direction="column" spacing="$space80" paddingTop="$space60">
            <Heading size="$size100" renderAs="h2" color="$gray14">
              Translations
            </Heading>

            <Stack direction="column" spacing="$space80">
              {state.translations.map((translation, index) => (
                <TextField
                  key={index}
                  label={languagesMap[translation.languageId].name}
                  value={translation.content}
                  placeholder="Enter a translation..."
                  onChange={content => {
                    setState(state => ({
                      ...state,
                      translations: state.translations.map((t, i) =>
                        i === index
                          ? {
                              ...t,
                              content,
                            }
                          : t,
                      ),
                    }))
                  }}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </ModalContent>
  )
}

export const UpsertGlossaryTermModal = forwardRef<UpsertGlossaryTermModalRef>(
  (_props, ref) => {
    const [glossary, setGlossary] =
      useState<Components.Schemas.Glossary | null>(null)
    const [term, setTerm] = useState<Components.Schemas.GlossaryTerm | null>(
      null,
    )
    const modalRef = useRef<ModalRef>(null!)

    useImperativeHandle(ref, () => ({
      open: (glossary, term) => {
        setGlossary(glossary)
        setTerm(term)
        modalRef.current.open()
      },
      close: () => {
        modalRef.current.close()
      },
    }))

    const close = useCallback(() => {
      modalRef.current.close()
    }, [])

    return (
      <Modal ref={modalRef}>
        {glossary && <Content glossary={glossary} term={term} close={close} />}
      </Modal>
    )
  },
)
