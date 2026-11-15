import { axios } from '@/dashboard/api/axios'
import type { BlogPostsInterface } from '../interfaces'
import { blogPostsEndpoints } from './blog-posts-endpoints'

export const getById = async (id: number): Promise<BlogPostsInterface> => {
  const result = await axios.get(blogPostsEndpoints.getById(id))

  return result.data.data
}
