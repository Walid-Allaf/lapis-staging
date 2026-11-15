import { useQuery } from '@tanstack/react-query'
import { getAll } from '../services'
import type { FaqsFiltersRequestInterface } from '../interfaces'

export const queryKey = 'faqs'

export function useFaqs(filters: FaqsFiltersRequestInterface) {
  const { data, isLoading, refetch, isRefetching, isError } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => getAll(filters)
  })

  return {
    queryKey,
    data,
    isLoading,
    refetch,
    isRefetching,
    isError
  }
}
