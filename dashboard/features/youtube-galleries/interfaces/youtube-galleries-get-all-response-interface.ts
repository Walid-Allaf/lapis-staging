import { MainType } from '@/dashboard/api/types/main-type'
import { YouTubeGalleriesInterface } from './youtube-galleries-interface'

export interface YouTubeGalleriesGetAllResponseInterface extends MainType {
  data: YouTubeGalleriesInterface[]
}
