import { useQuery } from '@tanstack/react-query'
import { getAll } from '../services'
import type { TestimonialsFiltersRequestInterface } from '../interfaces'

export const queryKey = 'testimonials'

export function useTestimonials(filters: TestimonialsFiltersRequestInterface) {
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
