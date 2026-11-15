export interface ServicesInterface {
    id: number
    nameAr: string
    nameEn: string
    simpleDescriptionAr: string
    simpleDescriptionEn: string
    descriptionAr: string
    descriptionEn: string
    order: number
    avatar: {
        id: number
        filePath: string
    }
    createdAt: string
    isActive: boolean
}
