import { MainType } from '@/dashboard/api/types/main-type'
import { TestimonialsInterface } from './testimonials-interface'

export interface TestimonialsGetAllResponseInterface extends MainType {
  data: TestimonialsInterface[]
}
