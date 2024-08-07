import { FC, Suspense, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useQueryClient } from '@tanstack/react-query'
import {
  Banner,
  Box,
  ConfirmationModal,
  ConfirmationModalRef,
  Stack,
} from 'design-system'
import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import {
  getListPhrasesQueryKey,
  useDeletePhrase,
  useGetProject,
} from '../../../../../generated/reactQuery'
import { useURLState } from '../../../../../hooks/urlState'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import routes from '../../../../../routing'
import { useModals } from '../../../hooks/modals'
import { FigmaFilesList } from '../components/FigmaFilesList'
import { PhrasesTable } from '../components/PhrasesTable/PhrasesTable'
import { ProjectStats } from '../components/ProjectStats'
import {
  UpdatePhrasePanel,
  UpdatePhrasePanelRef,
} from '../components/UpdatePhrasePanel/UpdatePhrasePanel'
import { useInfiniteListPhrases } from '../hooks'

export const Phrases: FC = () => {
  const queryClient = useQueryClient()
  const { key: workspaceKey } = useCurrentWorkspace()
  const [editingPhraseIndex, setEditingPhraseIndex] = useState<
    number | undefined
  >(undefined)

  const [state, setState] = useURLState<{
    translated: string | undefined
    untranslated: string | undefined
    key: string
    containsTags: string[]
  }>({
    initialState: {
      translated: undefined,
      untranslated: undefined,
      containsTags: [],
      key: '',
    },
  })

  const navigate = useNavigate()
  const params = useParams<'projectId' | 'revisionId'>()
  const updatePhraseModalRef = useRef<UpdatePhrasePanelRef>(null!)
  const confirmationModalRef = useRef<ConfirmationModalRef>(null!)
  const revisionId = params.revisionId!

  const { data, fetchNextPage, hasNextPage } = useInfiniteListPhrases({
    revisionId,
    key: state.key,
    translated: state.translated,
    untranslated: state.untranslated,
    tags: state.containsTags.length > 0 ? state.containsTags : undefined,
  })

  const phrasesQueryKey = useMemo(
    () =>
      getListPhrasesQueryKey({
        queryParams: {
          revisionId,
          key: state.key,
          translated: state.translated,
          untranslated: state.untranslated,
          tags: state.containsTags.length > 0 ? state.containsTags : undefined,
        },
      }),
    [
      revisionId,
      state.key,
      state.translated,
      state.untranslated,
      state.containsTags,
    ],
  )

  const phrases = useMemo(
    () => data?.pages.map(page => page.items).flat() ?? [],
    [data],
  )

  const { data: project } = useGetProject({
    queryParams: {
      id: params.projectId!,
    },
  })
  const { openCreatePhrase } = useModals()
  const { mutateAsync: deletePhrase, isPending: isDeletingPhrase } =
    useDeletePhrase({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: phrasesQueryKey,
        })
      },
    })

  if (!project) {
    return <HorizontalSpinner />
  }

  const hasLanguages = project.languages.length > 0

  return (
    <Box width="100%" paddingBottom="$space700">
      {editingPhraseIndex !== undefined && (
        <UpdatePhrasePanel
          ref={updatePhraseModalRef}
          projectId={project.id}
          revisionId={revisionId}
          phraseId={phrases[editingPhraseIndex].id}
          currentIndex={editingPhraseIndex}
          totalCount={phrases.length}
          onNext={() => setEditingPhraseIndex(index => index! + 1)}
          onPrevious={() => setEditingPhraseIndex(index => index! - 1)}
          onClose={() => {
            setEditingPhraseIndex(undefined)
          }}
        />
      )}

      <Stack width="100%" direction="column" spacing="$space200">
        {!hasLanguages && (
          <Banner
            variation="info"
            title="Welcome to your new project"
            description="Make sure to setup languages you want to use in it by updating project's settings"
            action={{
              label: 'Go to settings',
              onAction: () =>
                navigate(
                  routes.projectSettings.url({
                    pathParams: {
                      workspaceKey,
                      projectId: params.projectId!,
                    },
                  }),
                ),
            }}
          />
        )}

        <FigmaFilesList projectId={params.projectId!} />

        <ProjectStats projectId={params.projectId!} />

        <Suspense fallback={null}>
          <PhrasesTable
            project={project}
            phrases={phrases}
            phrasesTotalCount={data?.pages.at(0)?.pagination.itemsCount ?? 0}
            initialKey={state.key}
            setState={setState}
            translated={state.translated}
            untranslated={state.untranslated}
            containsTags={state.containsTags}
            revisionId={revisionId}
            isLoading={isDeletingPhrase}
            phrasesQueryKey={phrasesQueryKey}
            onRequestTranslate={index => {
              setEditingPhraseIndex(index)
              requestAnimationFrame(() => updatePhraseModalRef.current?.open())
            }}
            onRequestDelete={phraseId => {
              confirmationModalRef.current.confirm().then(res => {
                if (!res) {
                  return
                }

                setEditingPhraseIndex(undefined)
                deletePhrase({ body: { phraseId } })
              })
            }}
            onLoadMore={hasNextPage ? fetchNextPage : undefined}
            onRequestAdd={() => openCreatePhrase(project, revisionId)}
          />
        </Suspense>
      </Stack>

      <ConfirmationModal
        variation="danger"
        title="Are you sure about deleting this phrase?"
        description="Once a phrase is deleted, its content cannot be recovered."
        ref={confirmationModalRef}
      />
    </Box>
  )
}
