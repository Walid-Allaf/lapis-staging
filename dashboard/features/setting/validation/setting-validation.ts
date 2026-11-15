import * as Yup from 'yup'

const optionalUrl = Yup.string().trim().url('invalid_url')

const schema = Yup.object({
  phoneNumber: Yup.string().trim().required('please_fill_field'),
  email: Yup.string().trim().email('invalid_email').required('please_fill_field'),
  address: Yup.string().trim().required('please_fill_field'),
  latitude: Yup.number().typeError('please_fill_field').min(-90, 'please_fill_field').max(90, 'please_fill_field').required('please_fill_field'),
  longitude: Yup.number().typeError('please_fill_field').min(-180, 'please_fill_field').max(180, 'please_fill_field').required('please_fill_field'),
  aboutUs_Ar: Yup.string().trim().required('please_fill_field'),
  aboutUs_En: Yup.string().trim().required('please_fill_field'),
  contactUs_Ar: Yup.string().trim().required('please_fill_field'),
  contactUs_En: Yup.string().trim().required('please_fill_field'),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  twitterUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  faQsTabToggle: Yup.boolean().required('please_fill_field'),
  servicesTabToggle: Yup.boolean().required('please_fill_field'),
  galleriesTabToggle: Yup.boolean().required('please_fill_field'),
  youTubeGalleriesTabToggle: Yup.boolean().required('please_fill_field'),
  testimonialsTabToggle: Yup.boolean().required('please_fill_field'),
  ourSpecialistsTabToggle: Yup.boolean().required('please_fill_field')
})

export default schema
