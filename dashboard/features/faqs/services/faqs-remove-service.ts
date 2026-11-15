import axios from '@/dashboard/api/axios'
import { faqsEndpoints } from './faqs-endpoints'

export const remove = async (id: number) => {
  const response = await axios.delete(faqsEndpoints.remove(id))

  return response.data
}
