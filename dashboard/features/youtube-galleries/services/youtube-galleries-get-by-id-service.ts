import { axios } from '@/dashboard/api/axios'
import type { YouTubeGalleriesInterface } from '../interfaces'
import { youtubeGalleriesEndpoints } from './youtube-galleries-endpoints'

export const getById = async (id: number): Promise<YouTubeGalleriesInterface> => {
  const result = await axios.get(youtubeGalleriesEndpoints.getById(id))

  return result.data.data
}
