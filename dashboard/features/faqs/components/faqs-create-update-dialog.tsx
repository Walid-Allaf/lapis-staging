import { FormLoading, MainDialog } from '@/dashboard/components'
import { FaqsCreateUpdateForm } from './faqs-create-update-form'
import { faqsInitialValues } from '../constants'
import { FaqsFormInterface, FaqsOpenCreateUpdateInterface } from '../interfaces'
import { useFaqsGetById, useFaqsUpdate } from '../hooks'
import { FaqsSchema } from '../validation'
import { useTranslation } from 'react-i18next'

export default function AddEditDialog({ open, onClose }: FaqsOpenCreateUpdateInterface) {
  const { t } = useTranslation()
  const { handleCreate, handleUpdate } = useFaqsUpdate()
  const { dataById, isLoadingByID } = useFaqsGetById(open.faqsId)
  const isAdd = open.isAdd

  return (
    <MainDialog<FaqsFormInterface>
      open={open.isOpen}
      onClose={onClose}
      isRefetching={isLoadingByID}
      state={isAdd ? 'add' : 'edit'}
      initialValues={
        isAdd
          ? faqsInitialValues
          : {
              id: open.faqsId,
              questionAr: dataById?.questionAr ?? '',
              questionEn: dataById?.questionEn ?? '',
              answerAr: dataById?.answerAr ?? '',
              answerEn: dataById?.answerEn ?? '',
              isActive: dataById?.isActive ?? true
            }
      }
      validationSchema={FaqsSchema}
      handleCreate={(values) =>
        handleCreate({
          questionAr: values.questionAr,
          questionEn: values.questionEn,
          answerAr: values.answerAr,
          answerEn: values.answerEn,
          isActive: values.isActive
        })
      }
      handleUpdate={(values) =>
        handleUpdate({
          id: open.faqsId,
          questionAr: values.questionAr,
          questionEn: values.questionEn,
          answerAr: values.answerAr,
          answerEn: values.answerEn,
          isActive: values.isActive
        })
      }
      id={!isAdd ? open.faqsId : undefined}
      dialogTitle={isAdd ? t('faq_add') : t('faq_edit')}
      maxWidth='2xl'
    >
      {() => (isLoadingByID ? <FormLoading /> : <FaqsCreateUpdateForm />)}
    </MainDialog>
  )
}
