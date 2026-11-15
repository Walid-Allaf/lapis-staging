import axios from "@/dashboard/api/axios"
import { servicesEndpoints } from "./services-endpoints"
import { ServicesFiltersRequestInterface, ServicesGetAllResponseInterface } from "../interfaces"
import { getPageNumber, getPageSize } from '@/dashboard/utils'

export const getAll = async (filters: ServicesFiltersRequestInterface): Promise<ServicesGetAllResponseInterface> => {
  const response = await axios.get(servicesEndpoints.getAll, {
    params: {
      pageNumber: getPageNumber(),
      pageSize: getPageSize(),
      search: filters.search
    }
  })
  return response.data
}
