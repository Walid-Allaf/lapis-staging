import axios from '@/dashboard/api/axios'
import { youtubeGalleriesEndpoints } from './youtube-galleries-endpoints'

export const remove = async (id: number) => {
  const response = await axios.delete(youtubeGalleriesEndpoints.remove(id))

  return response.data
}
