import { useQuery } from '@tanstack/react-query'
import { getById } from '../services'
import { queryKey } from './use-testimonials'

export function useTestimonialsGetById(id: number) {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey, id],
    queryFn: () => getById(id),
    enabled: !!id
  })

  return {
    dataById: data,
    isLoadingByID: isLoading
  }
}
