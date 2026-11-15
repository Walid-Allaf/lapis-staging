export interface OurSpecialistsInterface {
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
}
