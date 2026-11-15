import axios from '@/dashboard/api/axios'
import { getPageNumber, getPageSize } from '@/dashboard/utils'
import { GalleryFiltersRequestInterface, GalleryGetAllResponseInterface } from '../interfaces'
import { galleryEndpoints } from './gallery-endpoints'

export const getAll = async (filters: GalleryFiltersRequestInterface): Promise<GalleryGetAllResponseInterface> => {
  const response = await axios.get(galleryEndpoints.getAll, {
    params: {
      pageNumber: getPageNumber(),
      pageSize: getPageSize(),
      search: filters.search
    }
  })

  return response.data
}
