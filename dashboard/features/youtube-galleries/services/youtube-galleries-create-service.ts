import axios from '@/dashboard/api/axios'
import { YouTubeGalleriesCreateRequestInterface } from '../interfaces'
import { youtubeGalleriesEndpoints } from './youtube-galleries-endpoints'

export const create = async (values: YouTubeGalleriesCreateRequestInterface) => {
  const response = await axios.post(youtubeGalleriesEndpoints.add, values)

  return response.data
}
