import axios from '@/dashboard/api/axios'
import { FaqsCreateRequestInterface } from '../interfaces'
import { faqsEndpoints } from './faqs-endpoints'

export const create = async (values: FaqsCreateRequestInterface) => {
  const response = await axios.post(faqsEndpoints.add, values)

  return response.data
}
