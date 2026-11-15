import { MainType } from '@/dashboard/api/types/main-type'
import { BlogPostsInterface } from './blog-posts-interface'

export interface BlogPostsGetAllResponseInterface extends MainType {
  data: BlogPostsInterface[]
}
