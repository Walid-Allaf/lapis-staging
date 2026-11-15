import { useQuery } from '@tanstack/react-query'
import { getAll } from '../services'
import type { BlogPostsFiltersRequestInterface } from '../interfaces'

export const queryKey = 'blog-posts'

export function useBlogPosts(filters: BlogPostsFiltersRequestInterface) {
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
