import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5000,
      refetchOnWindowFocus: false,
      networkMode: 'always',
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})
