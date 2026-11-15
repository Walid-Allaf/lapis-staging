import * as Yup from 'yup'

const schema = Yup.object({
  questionAr: Yup.string().trim().required('please_fill_field'),
  questionEn: Yup.string().trim().required('please_fill_field'),
  answerAr: Yup.string().trim().required('please_fill_field'),
  answerEn: Yup.string().trim().required('please_fill_field')
})

export default schema
