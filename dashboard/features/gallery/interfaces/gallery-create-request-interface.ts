export interface GalleryCreateRequestInterface {
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  beforeFileId: number | null
  afterFileId: number | null
  isActive: boolean
}
