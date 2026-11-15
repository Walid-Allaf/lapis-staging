export interface BlogPostsSpecialistOptionInterface {
  id: number
  name: string
}

export interface BlogPostsFormInterface {
  id?: number
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  contentAr: string
  contentEn: string
  ourSpecialistId: BlogPostsSpecialistOptionInterface | null
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
