import axios from '@/dashboard/api/axios'
import { FaqsUpdateRequestInterface } from '../interfaces'
import { faqsEndpoints } from './faqs-endpoints'

export const update = async (values: FaqsUpdateRequestInterface) => {
  const response = await axios.put(faqsEndpoints.update(values.id || 0), values)

  return response.data
}
