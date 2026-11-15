export interface BlogPostsInterface {
  id: number
  titleAr: string
  titleEn: string
  slug: string
  summaryAr: string
  summaryEn: string
  contentAr: string
  contentEn: string
  ourSpecialistId: number
  ourSpecialist: {
    id: number
    nameAr: string
    nameEn: string
    descriptionAr: string
    descriptionEn: string
    specialistAr: string
    specialistEn: string
    image: {
      id: number
      filePath: string
    } | null
    createdAt: string
    isActive: boolean
  } | null
  metaTitleAr: string
  metaTitleEn: string
  metaDescriptionAr: string
  metaDescriptionEn: string
  status: number
  isFeatured: boolean
  order: number
  image: {
    id: number
    filePath: string
  } | null
  createdAt: string
  updatedAt: string
  isActive: boolean
}
