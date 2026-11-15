import { axios } from '@/dashboard/api/axios'
import type { GalleryInterface } from '../interfaces'
import { galleryEndpoints } from './gallery-endpoints'

export const getById = async (id: number): Promise<GalleryInterface> => {
  const result = await axios.get(galleryEndpoints.getById(id))

  return result.data.data
}
