import axios from '@/dashboard/api/axios'
import { TestimonialsUpdateRequestInterface } from '../interfaces'
import { testimonialsEndpoints } from './testimonials-endpoints'

export const update = async (values: TestimonialsUpdateRequestInterface) => {
  const response = await axios.put(testimonialsEndpoints.update(values.id || 0), values)

  return response.data
}
