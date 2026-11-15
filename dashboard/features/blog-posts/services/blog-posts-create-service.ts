import axios from '@/dashboard/api/axios'
import { BlogPostsCreateRequestInterface } from '../interfaces'
import { blogPostsEndpoints } from './blog-posts-endpoints'

export const create = async (values: BlogPostsCreateRequestInterface) => {
  const response = await axios.post(blogPostsEndpoints.add, values)

  return response.data
}
