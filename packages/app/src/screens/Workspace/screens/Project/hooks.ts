import {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query'
import {
  ListEmailLayoutsParameters,
  ListEmailTemplatesParameters,
  ListPhrasesParameters,
  getListEmailLayoutsQueryKey,
  getListEmailTemplatesQueryKey,
  getListPhrasesQueryKey,
  useAPIClient,
} from '../../../../generated/reactQuery'
import { Paths } from '../../../../generated/typeDefinitions'

export const useInfiniteListPhrases = (
  parameters: Omit<ListPhrasesParameters['queryParams'], 'page'>,
  options?: Omit<
    UseInfiniteQueryOptions<
      Paths.ListPhrases.Responses.$200,
      unknown,
      InfiniteData<Paths.ListPhrases.Responses.$200>,
      Paths.ListPhrases.Responses.$200,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  const apiClient = useAPIClient()
  const queryKey = getListPhrasesQueryKey({ queryParams: parameters })

  return useInfiniteQuery<
    Paths.ListPhrases.Responses.$200,
    unknown,
    InfiniteData<Paths.ListPhrases.Responses.$200>,
    QueryKey,
    number
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.listPhrases({
        queryParams: {
          ...parameters,
          page: pageParam,
        },
      })

      if (!response.ok) {
        return Promise.reject(response)
      }

      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages): number | undefined =>
      lastPage.pagination?.pagesCount > pages.length
        ? pages.length + 1
        : undefined,
    ...options,
  })
}

export const useInfiniteListEmailLayouts = (
  parameters: Omit<ListEmailLayoutsParameters['queryParams'], 'page'>,
  options?: Omit<
    UseInfiniteQueryOptions<
      Paths.ListEmailLayouts.Responses.$200,
      unknown,
      InfiniteData<Paths.ListEmailLayouts.Responses.$200>,
      Paths.ListEmailLayouts.Responses.$200,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  const apiClient = useAPIClient()
  const queryKey = getListEmailLayoutsQueryKey({ queryParams: parameters })

  return useInfiniteQuery<
    Paths.ListEmailLayouts.Responses.$200,
    unknown,
    InfiniteData<Paths.ListEmailLayouts.Responses.$200>,
    QueryKey,
    number
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.listEmailLayouts({
        queryParams: {
          ...parameters,
          page: pageParam,
        },
      })

      if (!response.ok) {
        return Promise.reject(response)
      }

      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages): number | undefined =>
      lastPage.pagination?.pagesCount > pages.length
        ? pages.length + 1
        : undefined,
    ...options,
  })
}

export const useInfiniteListEmailTemplates = (
  parameters: Omit<ListEmailTemplatesParameters['queryParams'], 'page'>,
  options?: Omit<
    UseInfiniteQueryOptions<
      Paths.ListEmailTemplates.Responses.$200,
      unknown,
      InfiniteData<Paths.ListEmailTemplates.Responses.$200>,
      Paths.ListEmailTemplates.Responses.$200,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  const apiClient = useAPIClient()
  const queryKey = getListEmailTemplatesQueryKey({ queryParams: parameters })

  return useInfiniteQuery<
    Paths.ListEmailTemplates.Responses.$200,
    unknown,
    InfiniteData<Paths.ListEmailTemplates.Responses.$200>,
    QueryKey,
    number
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.listEmailTemplates({
        queryParams: {
          ...parameters,
          page: pageParam,
        },
      })

      if (!response.ok) {
        return Promise.reject(response)
      }

      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages): number | undefined =>
      lastPage.pagination?.pagesCount > pages.length
        ? pages.length + 1
        : undefined,
    ...options,
  })
}
