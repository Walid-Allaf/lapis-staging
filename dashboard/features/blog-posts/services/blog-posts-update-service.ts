import axios from '@/dashboard/api/axios'
import { BlogPostsUpdateRequestInterface } from '../interfaces'
import { blogPostsEndpoints } from './blog-posts-endpoints'

export const update = async (values: BlogPostsUpdateRequestInterface) => {
  const response = await axios.put(blogPostsEndpoints.update(values.id || 0), values)

  return response.data
}
