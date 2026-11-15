import axios from '@/dashboard/api/axios'
import { testimonialsEndpoints } from './testimonials-endpoints'

export const remove = async (id: number) => {
  const response = await axios.delete(testimonialsEndpoints.remove(id))

  return response.data
}
