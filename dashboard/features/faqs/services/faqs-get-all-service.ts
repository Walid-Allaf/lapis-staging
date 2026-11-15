import axios from '@/dashboard/api/axios'
import { getPageNumber, getPageSize } from '@/dashboard/utils'
import { FaqsFiltersRequestInterface, FaqsGetAllResponseInterface } from '../interfaces'
import { faqsEndpoints } from './faqs-endpoints'

export const getAll = async (filters: FaqsFiltersRequestInterface): Promise<FaqsGetAllResponseInterface> => {
  const response = await axios.get(faqsEndpoints.getAll, {
    params: {
      pageNumber: getPageNumber(),
      pageSize: getPageSize(),
      search: filters.search
    }
  })

  return response.data
}
