import * as Yup from 'yup'

const schema = Yup.object({
  nameAr: Yup.string().trim().required('please_fill_field'),
  nameEn: Yup.string().trim().required('please_fill_field'),
  descriptionAr: Yup.string().trim().required('please_fill_field'),
  descriptionEn: Yup.string().trim().required('please_fill_field'),
  specialistAr: Yup.string().trim().required('please_fill_field'),
  specialistEn: Yup.string().trim().required('please_fill_field')
})

export default schema
