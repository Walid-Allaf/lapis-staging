import { axios } from '@/dashboard/api/axios'
import type { TestimonialsInterface } from '../interfaces'
import { testimonialsEndpoints } from './testimonials-endpoints'

export const getById = async (id: number): Promise<TestimonialsInterface> => {
  const result = await axios.get(testimonialsEndpoints.getById(id))

  return result.data.data
}
