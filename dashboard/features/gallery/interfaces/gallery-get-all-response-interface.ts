import { MainType } from '@/dashboard/api/types/main-type'
import { GalleryInterface } from './gallery-interface'

export interface GalleryGetAllResponseInterface extends MainType {
  data: GalleryInterface[]
}
