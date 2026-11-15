import axios from '@/dashboard/api/axios'
import { OurSpecialistsUpdateRequestInterface } from '../interfaces'
import { ourSpecialistsEndpoints } from './our-specialists-endpoints'

export const update = async (values: OurSpecialistsUpdateRequestInterface) => {
  const response = await axios.put(ourSpecialistsEndpoints.update(values.id || 0), values)

  return response.data
}
