import axios from '@/dashboard/api/axios'
import { GalleryUpdateRequestInterface } from '../interfaces'
import { galleryEndpoints } from './gallery-endpoints'

export const update = async (values: GalleryUpdateRequestInterface) => {
  const response = await axios.put(galleryEndpoints.update(values.id || 0), values)

  return response.data
}
