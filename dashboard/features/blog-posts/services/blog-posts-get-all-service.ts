import axios from '@/dashboard/api/axios'
import { getPageNumber, getPageSize } from '@/dashboard/utils'
import { BlogPostsFiltersRequestInterface, BlogPostsGetAllResponseInterface } from '../interfaces'
import { blogPostsEndpoints } from './blog-posts-endpoints'

export const getAll = async (filters: BlogPostsFiltersRequestInterface): Promise<BlogPostsGetAllResponseInterface> => {
  const response = await axios.get(blogPostsEndpoints.getAll, {
    params: {
      pageNumber: getPageNumber(),
      pageSize: getPageSize(),
      search: filters.search
    }
  })

  return response.data
}
