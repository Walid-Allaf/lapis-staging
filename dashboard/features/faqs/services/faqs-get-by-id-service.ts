import { axios } from '@/dashboard/api/axios'
import type { FaqsInterface } from '../interfaces'
import { faqsEndpoints } from './faqs-endpoints'

export const getById = async (id: number): Promise<FaqsInterface> => {
  const result = await axios.get(faqsEndpoints.getById(id))

  return result.data.data
}
