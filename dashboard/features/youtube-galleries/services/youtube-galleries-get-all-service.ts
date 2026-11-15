import axios from '@/dashboard/api/axios'
import { getPageNumber, getPageSize } from '@/dashboard/utils'
import { YouTubeGalleriesFiltersRequestInterface, YouTubeGalleriesGetAllResponseInterface } from '../interfaces'
import { youtubeGalleriesEndpoints } from './youtube-galleries-endpoints'

export const getAll = async (filters: YouTubeGalleriesFiltersRequestInterface): Promise<YouTubeGalleriesGetAllResponseInterface> => {
  const response = await axios.get(youtubeGalleriesEndpoints.getAll, {
    params: {
      pageNumber: getPageNumber(),
      pageSize: getPageSize(),
      search: filters.search
    }
  })

  return response.data
}
