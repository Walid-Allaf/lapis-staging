import * as Yup from 'yup'

const schema = Yup.object({
  titleAr: Yup.string().trim().required('please_fill_field'),
  titleEn: Yup.string().trim().required('please_fill_field'),
  descriptionAr: Yup.string().trim().required('please_fill_field'),
  descriptionEn: Yup.string().trim().required('please_fill_field'),
  videoUrl: Yup.string().trim().url('invalid_url').required('please_fill_field')
})

export default schema
