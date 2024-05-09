import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRequest } from '../request'
import {
  batchCreatePhrase,
  connectPhrase,
  createFigmaDocument,
  createPhrase,
  deleteFigmaDocument,
  getFigmaDocument,
  listLanguagesByProject,
  listProjects,
  listRevisionsByProject,
  searchPhrases,
  syncFigmaDocument,
  updatePhraseForDocument,
} from './functions'

export const useProjects = () => {
  const request = useRequest()
  return useQuery('projects', listProjects(request), {
    staleTime: Infinity,
  })
}

export const useLanguagesByProject = (projectId: string) => {
  const request = useRequest()
  return useQuery(
    ['projects', projectId, 'languages'],
    listLanguagesByProject({
      request,
      projectId,
    }),
    {
      staleTime: Infinity,
    },
  )
}

export const useRevisionsByProject = (projectId: string) => {
  const request = useRequest()
  return useQuery(
    ['projects', projectId, 'revisions'],
    listRevisionsByProject({
      request,
      projectId,
    }),
    {
      staleTime: Infinity,
    },
  )
}

export const useCreateFigmaDocument = () => {
  const request = useRequest()
  return useMutation(createFigmaDocument(request))
}

export const useFigmaDocument = (id: string) => {
  const request = useRequest()
  return useQuery(['documents', id], getFigmaDocument(request, id), {
    staleTime: Infinity,
    retry: 0,
  })
}

export const useSyncFigmaDocument = (id: string) => {
  const request = useRequest()
  const queryClient = useQueryClient()
  return useMutation(syncFigmaDocument(request), {
    onSuccess: () => {
      queryClient.invalidateQueries(['documents', id])
    },
  })
}

export const useCreatePhrase = () => {
  const request = useRequest()
  return useMutation(createPhrase(request))
}

export const useBatchCreatePhrase = () => {
  const request = useRequest()
  return useMutation(batchCreatePhrase(request))
}

export const useConnectPhrase = () => {
  const request = useRequest()
  return useMutation(connectPhrase(request))
}

export const useDeleteFigmaDocument = () => {
  const request = useRequest()
  return useMutation(deleteFigmaDocument(request))
}

export const useUpdatePhraseForDocument = () => {
  const request = useRequest()
  return useMutation(updatePhraseForDocument(request))
}

interface UseSearchPhrasesParams {
  documentId: string
  term: string
}

export const useSearchPhrases = ({
  documentId,
  term,
}: UseSearchPhrasesParams) => {
  const request = useRequest()
  return useQuery(
    ['searchPhrases', documentId, term],
    searchPhrases({
      request,
      params: { document_id: documentId, term },
    }),
    {
      enabled: term.length > 2,
      staleTime: 1000 * 15,
    },
  )
}
