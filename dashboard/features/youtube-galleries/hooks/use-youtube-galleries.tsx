import { useQuery } from '@tanstack/react-query'
import { getAll } from '../services'
import type { YouTubeGalleriesFiltersRequestInterface } from '../interfaces'

export const queryKey = 'youtube-galleries'

export function useYouTubeGalleries(filters: YouTubeGalleriesFiltersRequestInterface) {
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
