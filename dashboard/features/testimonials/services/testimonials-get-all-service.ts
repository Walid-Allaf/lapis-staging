import axios from '@/dashboard/api/axios'
import { getPageNumber, getPageSize } from '@/dashboard/utils'
import { TestimonialsFiltersRequestInterface, TestimonialsGetAllResponseInterface } from '../interfaces'
import { testimonialsEndpoints } from './testimonials-endpoints'

export const getAll = async (filters: TestimonialsFiltersRequestInterface): Promise<TestimonialsGetAllResponseInterface> => {
  const response = await axios.get(testimonialsEndpoints.getAll, {
    params: {
      pageNumber: getPageNumber(),
      pageSize: getPageSize(),
      search: filters.search
    }
  })

  return response.data
}
