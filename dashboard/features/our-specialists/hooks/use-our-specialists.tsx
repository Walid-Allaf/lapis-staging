import { useQuery } from '@tanstack/react-query'
import { getAll } from '../services'
import type { OurSpecialistsFiltersRequestInterface } from '../interfaces'

export const queryKey = 'our-specialists'

export function useOurSpecialists(filters: OurSpecialistsFiltersRequestInterface) {
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
