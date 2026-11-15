import { axios } from '@/dashboard/api/axios'
import type { OurSpecialistsInterface } from '../interfaces'
import { ourSpecialistsEndpoints } from './our-specialists-endpoints'

export const getById = async (id: number): Promise<OurSpecialistsInterface> => {
  const result = await axios.get(ourSpecialistsEndpoints.getById(id))

  return result.data.data
}
