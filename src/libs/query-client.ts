// React Query Client Configuration
// Creates and configures the QueryClient for data fetching and caching

import { QueryClient } from '@tanstack/react-query'

export function getDefaultQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000, // 1 minute
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    })
}
