import { MainType } from '@/dashboard/api/types/main-type'
import { FaqsInterface } from './faqs-interface'

export interface FaqsGetAllResponseInterface extends MainType {
  data: FaqsInterface[]
}
