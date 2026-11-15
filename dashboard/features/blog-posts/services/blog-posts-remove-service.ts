import axios from '@/dashboard/api/axios'
import { blogPostsEndpoints } from './blog-posts-endpoints'

export const remove = async (id: number) => {
  const response = await axios.delete(blogPostsEndpoints.remove(id))

  return response.data
}
