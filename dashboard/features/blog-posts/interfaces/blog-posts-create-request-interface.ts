export interface BlogPostsCreateRequestInterface {
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  contentAr: string
  contentEn: string
  ourSpecialistId: number
  metaTitleAr: string
  metaTitleEn: string
  metaDescriptionAr: string
  metaDescriptionEn: string
  status: number
  isFeatured: boolean
  order: number
  fileId: number | null
  isActive: boolean
}
