import axios from '@/dashboard/api/axios'
import { galleryEndpoints } from './gallery-endpoints'

export const remove = async (id: number) => {
  const response = await axios.delete(galleryEndpoints.remove(id))

  return response.data
}
