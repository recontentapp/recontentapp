import queryString from 'query-string'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { FullpageSpinner } from '../../../../components/FullpageSpinner'
import { Head } from '../../../../components/Head'
import {
  useGetPhrase,
  useGetProject,
  useTranslatePhrase,
} from '../../../../generated/reactQuery'
import { useURLState } from '../../../../hooks/urlState'
import { useCurrentWorkspace } from '../../../../hooks/workspace'
import routes from '../../../../routing'
import { useKBarContext } from '../../components/KBar'
import { Page } from '../../components/Page'
import { ScreenWrapper } from '../../components/ScreenWrapper'
import { useInfiniteListPhrases } from '../Project/hooks'

const useInitialPhraseId = () => {
  const location = useLocation()
  const phraseIdRef = useRef(
    queryString.parseUrl(location.search).query.phraseId,
  )

  return typeof phraseIdRef.current === 'string' ? phraseIdRef.current : null
}

export const Editor = () => {
  const { key: workspaceKey, name: workspaceName } = useCurrentWorkspace()
  const { setProjectContext } = useKBarContext()
  const params = useParams<'projectId' | 'revisionId'>()
  const initialPhraseId = useInitialPhraseId()
  const { data: project } = useGetProject({
    queryParams: { id: params.projectId! },
  })
  const [state] = useURLState<{
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
  const [currentPhraseId, setCurrentPhraseId] = useState<string | null>(null)

  const { data, fetchNextPage, hasNextPage } = useInfiniteListPhrases({
    revisionId: params.revisionId!,
    key: state.key,
    translated: state.translated,
    untranslated: state.untranslated,
    tags: state.containsTags.length > 0 ? state.containsTags : undefined,
  })

  const phraseIds = useMemo(() => {
    if (data === undefined || !initialPhraseId) {
      return []
    }

    const set = new Set<string>()
    set.add(initialPhraseId)

    data.pages.forEach(page => {
      page.items.forEach(phrase => {
        set.add(phrase.id)
      })
    })

    return Array.from(set)
  }, [data, initialPhraseId])

  useEffect(() => {
    if (currentPhraseId || phraseIds.length === 0) {
      return
    }

    setCurrentPhraseId(phraseIds[0])
  }, [currentPhraseId, phraseIds])

  useEffect(() => {
    if (!project) {
      return
    }

    setProjectContext(project, params.revisionId || project.masterRevisionId)

    return () => {
      setProjectContext(null, null)
    }
  }, [project, params.revisionId, setProjectContext])

  const { data: phrase, isLoading: isLoadingPhrase } = useGetPhrase(
    {
      queryParams: {
        phraseId: String(currentPhraseId),
      },
    },
    { enabled: !!currentPhraseId },
  )
  const { mutateAsync: translate, isPending: isTranslating } =
    useTranslatePhrase()

  if (!project || !phrase) {
    return <FullpageSpinner />
  }

  return (
    <ScreenWrapper
      breadcrumbItems={[
        {
          label: workspaceName,
          path: routes.dashboard.url({ pathParams: { workspaceKey } }),
        },
        {
          label: project.name,
          path: routes.projectPhrases.url({
            pathParams: {
              workspaceKey,
              projectId: project.id,
              revisionId: project.masterRevisionId,
            },
          }),
        },
        {
          label: 'Phrase editor',
        },
      ]}
    >
      <Head title={project.name} />
      <Page title={phrase.key}>
        <p>Poop</p>
      </Page>
    </ScreenWrapper>
  )
}
