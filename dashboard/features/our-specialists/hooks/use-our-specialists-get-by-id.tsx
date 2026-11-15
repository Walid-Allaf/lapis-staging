import { useQuery } from '@tanstack/react-query'
import { getById } from '../services'
import { queryKey } from './use-our-specialists'

export function useOurSpecialistsGetById(id: number) {
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
