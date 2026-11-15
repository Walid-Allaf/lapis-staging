import axios from '@/dashboard/api/axios'
import { getPageNumber, getPageSize } from '@/dashboard/utils'
import { OurSpecialistsFiltersRequestInterface, OurSpecialistsGetAllResponseInterface } from '../interfaces'
import { ourSpecialistsEndpoints } from './our-specialists-endpoints'

export const getAll = async (filters: OurSpecialistsFiltersRequestInterface): Promise<OurSpecialistsGetAllResponseInterface> => {
  const response = await axios.get(ourSpecialistsEndpoints.getAll, {
    params: {
      pageNumber: getPageNumber(),
      pageSize: getPageSize(),
      search: filters.search
    }
  })

  return response.data
}
