import { MainType } from '@/dashboard/api/types/main-type'
import { OurSpecialistsInterface } from './our-specialists-interface'

export interface OurSpecialistsGetAllResponseInterface extends MainType {
  data: OurSpecialistsInterface[]
}
