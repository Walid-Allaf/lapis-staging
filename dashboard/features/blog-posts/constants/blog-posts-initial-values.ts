import { BlogPostsFormInterface } from '../interfaces'

export const blogPostsInitialValues: BlogPostsFormInterface = {
  id: 0,
  titleAr: '',
  titleEn: '',
  summaryAr: '',
  summaryEn: '',
  contentAr: '',
  contentEn: '',
  ourSpecialistId: null,
  metaTitleAr: '',
  metaTitleEn: '',
  metaDescriptionAr: '',
  metaDescriptionEn: '',
  status: 0,
  isFeatured: false,
  order: 0,
  fileId: null,
  isActive: true
}
