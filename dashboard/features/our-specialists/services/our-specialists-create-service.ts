import axios from '@/dashboard/api/axios'
import { OurSpecialistsCreateRequestInterface } from '../interfaces'
import { ourSpecialistsEndpoints } from './our-specialists-endpoints'

export const create = async (values: OurSpecialistsCreateRequestInterface) => {
  const response = await axios.post(ourSpecialistsEndpoints.add, values)

  return response.data
}
