import { useQuery } from '@tanstack/react-query'
import { getAll } from '../services'
import type { GalleryFiltersRequestInterface } from '../interfaces'

export const queryKey = 'gallery'

export function useGallery(filters: GalleryFiltersRequestInterface) {
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
