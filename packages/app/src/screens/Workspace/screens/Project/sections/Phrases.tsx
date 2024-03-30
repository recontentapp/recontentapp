import { FC, Suspense, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { HorizontalSpinner } from '../../../../../components/HorizontalSpinner'
import { Banner, Box, Stack } from '../../../../../components/primitives'
import { useURLState } from '../../../../../hooks/urlState'
import { useModals } from '../../../hooks/modals'
import { PhrasesTable } from '../components/PhrasesTable'
import {
  UpdatePhraseModal,
  UpdatePhraseModalRef,
} from '../components/UpdatePhraseModal'
import {
  getListPhrasesQueryKey,
  useDeletePhrase,
  useGetProject,
  useListPhrases,
  useListWorkspaceLanguages,
} from '../../../../../generated/reactQuery'
import { useCurrentWorkspace } from '../../../../../hooks/workspace'
import { useQueryClient } from '@tanstack/react-query'
import routes from '../../../../../routing'

export const Phrases: FC = () => {
  const queryClient = useQueryClient()
  const { key: workspaceKey, id: workspaceId } = useCurrentWorkspace()
  const [editingPhraseIndex, setEditingPhraseIndex] = useState<
    number | undefined
  >(undefined)

  const [state, setState] = useURLState<{
    translated: string | undefined
    untranslated: string | undefined
    key: string
  }>({
    initialState: {
      translated: undefined,
      untranslated: undefined,
      key: '',
    },
  })

  const navigate = useNavigate()
  const params = useParams<'projectId' | 'revisionId'>()
  const updatePhraseModalRef = useRef<UpdatePhraseModalRef>(null!)

  const revisionId = params.revisionId!

  const { data } = useListPhrases({
    queryParams: {
      revisionId,
      key: state.key,
      translated: state.translated,
      untranslated: state.untranslated,
    },
  })

  const phrases = useMemo(() => data?.items ?? [], [data])

  const { data: project } = useGetProject({
    queryParams: {
      id: params.projectId!,
    },
  })
  const { data: languages } = useListWorkspaceLanguages({
    queryParams: { workspaceId },
  })
  const { openCreatePhrase } = useModals()
  const { mutateAsync: deletePhrase, isPending: isDeletingPhrase } =
    useDeletePhrase({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListPhrasesQueryKey({ queryParams: { revisionId } }),
        })
      },
    })

  if (!project || !languages) {
    return <HorizontalSpinner />
  }

  const hasLanguages = project.languages.length > 0

  return (
    <Box width="100%" paddingBottom="$space700">
      {editingPhraseIndex !== undefined && (
        <UpdatePhraseModal
          ref={updatePhraseModalRef}
          projectId={project.id}
          revisionId={revisionId}
          phraseId={phrases[editingPhraseIndex].id}
          hasNext={editingPhraseIndex < phrases.length - 1}
          hasPrevious={editingPhraseIndex > 0}
          onNext={() => setEditingPhraseIndex(index => index! + 1)}
          onPrevious={() => setEditingPhraseIndex(index => index! - 1)}
          onClose={() => {
            setEditingPhraseIndex(undefined)
            // TODO
            // queryClient.invalidateQueries([
            //   'projects',
            //   params.projectId!,
            //   'revisions',
            //   revisionId,
            //   'translationProgression',
            // ])
          }}
        />
      )}

      <Stack width="100%" direction="column" spacing="$space400">
        <Stack direction="column" spacing="$space100">
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
        </Stack>

        <Suspense fallback={null}>
          <PhrasesTable
            project={project}
            phrases={phrases}
            phrasesTotalCount={data?.pagination.itemsCount ?? 0}
            initialKey={state.key}
            setState={setState}
            translated={state.translated}
            untranslated={state.untranslated}
            revisionId={revisionId}
            isLoading={isDeletingPhrase}
            onRequestTranslate={index => {
              setEditingPhraseIndex(index)
              requestAnimationFrame(() => updatePhraseModalRef.current?.open())
            }}
            onRequestDelete={phraseId => {
              setEditingPhraseIndex(undefined)
              deletePhrase({ body: { phraseId } })
            }}
            onLoadMore={undefined}
            onRequestAdd={() => openCreatePhrase(project, revisionId)}
          />
        </Suspense>
      </Stack>
    </Box>
  )
}
