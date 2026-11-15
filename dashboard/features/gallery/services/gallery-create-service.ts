import axios from '@/dashboard/api/axios'
import { GalleryCreateRequestInterface } from '../interfaces'
import { galleryEndpoints } from './gallery-endpoints'

export const create = async (values: GalleryCreateRequestInterface) => {
  const response = await axios.post(galleryEndpoints.add, values)

  return response.data
}
