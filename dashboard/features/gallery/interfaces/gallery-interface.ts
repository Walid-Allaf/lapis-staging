export interface GalleryInterface {
  id: number
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  beforeImage: {
    id: number
    filePath: string
  } | null
  afterImage: {
    id: number
    filePath: string
  } | null
  createdAt: string
  isActive: boolean
}
