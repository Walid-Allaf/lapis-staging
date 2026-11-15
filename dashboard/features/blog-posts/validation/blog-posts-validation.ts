import * as Yup from 'yup'

const schema = Yup.object({
  titleAr: Yup.string().trim().required('please_fill_field'),
  titleEn: Yup.string().trim().required('please_fill_field'),
  summaryAr: Yup.string().trim().required('please_fill_field'),
  summaryEn: Yup.string().trim().required('please_fill_field'),
  contentAr: Yup.string().trim().required('please_fill_field'),
  contentEn: Yup.string().trim().required('please_fill_field'),
  ourSpecialistId: Yup.object({
    id: Yup.number().min(1, 'please_fill_field').required('please_fill_field'),
    name: Yup.string()
  })
    .nullable()
    .required('please_fill_field'),
  metaTitleAr: Yup.string().trim().required('please_fill_field'),
  metaTitleEn: Yup.string().trim().required('please_fill_field'),
  metaDescriptionAr: Yup.string().trim().required('please_fill_field'),
  metaDescriptionEn: Yup.string().trim().required('please_fill_field'),
  status: Yup.number().min(0, 'please_fill_field').required('please_fill_field'),
  order: Yup.number().min(0, 'please_fill_field').required('please_fill_field'),
  fileId: Yup.number().nullable().required('please_fill_field')
})

export default schema
