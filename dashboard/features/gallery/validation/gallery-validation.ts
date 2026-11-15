import * as Yup from 'yup'

const schema = Yup.object({
  titleAr: Yup.string().trim().required('please_fill_field'),
  titleEn: Yup.string().trim().required('please_fill_field'),
  descriptionAr: Yup.string().trim().required('please_fill_field'),
  descriptionEn: Yup.string().trim().required('please_fill_field'),
  beforeFileId: Yup.number().nullable().required('please_fill_field'),
  afterFileId: Yup.number().nullable().required('please_fill_field')
})

export default schema
