export interface TestimonialsInterface {
  id: number
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  starNumber: number
  avatar: {
    id: number
    filePath: string
  } | null
  createdAt: string
  isActive: boolean
}
