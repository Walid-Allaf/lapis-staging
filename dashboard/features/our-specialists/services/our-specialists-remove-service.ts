import axios from '@/dashboard/api/axios'
import { ourSpecialistsEndpoints } from './our-specialists-endpoints'

export const remove = async (id: number) => {
  const response = await axios.delete(ourSpecialistsEndpoints.remove(id))

  return response.data
}
