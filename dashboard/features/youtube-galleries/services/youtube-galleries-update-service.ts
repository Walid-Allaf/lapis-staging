import axios from '@/dashboard/api/axios'
import { YouTubeGalleriesUpdateRequestInterface } from '../interfaces'
import { youtubeGalleriesEndpoints } from './youtube-galleries-endpoints'

export const update = async (values: YouTubeGalleriesUpdateRequestInterface) => {
  const response = await axios.put(youtubeGalleriesEndpoints.update(values.id || 0), values)

  return response.data
}
