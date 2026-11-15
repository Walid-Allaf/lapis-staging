import * as Yup from 'yup'

const schema = Yup.object({
  titleAr: Yup.string().trim().required('please_fill_field'),
  titleEn: Yup.string().trim().required('please_fill_field'),
  descriptionAr: Yup.string().trim().required('please_fill_field'),
  descriptionEn: Yup.string().trim().required('please_fill_field'),
  starNumber: Yup.number().min(1, 'please_fill_field').required('please_fill_field')
})

export default schema
