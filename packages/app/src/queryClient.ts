import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 5, // 5 seconds
      refetchOnWindowFocus: false,
      networkMode: 'always',
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})
