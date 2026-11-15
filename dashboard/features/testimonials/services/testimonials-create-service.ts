import axios from '@/dashboard/api/axios'
import { TestimonialsCreateRequestInterface } from '../interfaces'
import { testimonialsEndpoints } from './testimonials-endpoints'

export const create = async (values: TestimonialsCreateRequestInterface) => {
  const response = await axios.post(testimonialsEndpoints.add, values)

  return response.data
}
