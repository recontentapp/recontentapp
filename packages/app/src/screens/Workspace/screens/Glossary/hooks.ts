import {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query'
import {
  ListGlossaryTermsParameters,
  getListGlossaryTermsQueryKey,
  useAPIClient,
} from '../../../../generated/reactQuery'
import { Paths } from '../../../../generated/typeDefinitions'

export const useInfiniteListGlossaryTerms = (
  parameters: Omit<ListGlossaryTermsParameters['queryParams'], 'page'>,
  options?: Omit<
    UseInfiniteQueryOptions<
      Paths.ListGlossaryTerms.Responses.$200,
      unknown,
      InfiniteData<Paths.ListGlossaryTerms.Responses.$200>,
      Paths.ListGlossaryTerms.Responses.$200,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  const apiClient = useAPIClient()
  const queryKey = getListGlossaryTermsQueryKey({ queryParams: parameters })

  return useInfiniteQuery<
    Paths.ListGlossaryTerms.Responses.$200,
    unknown,
    InfiniteData<Paths.ListGlossaryTerms.Responses.$200>,
    QueryKey,
    number
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.listGlossaryTerms({
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
