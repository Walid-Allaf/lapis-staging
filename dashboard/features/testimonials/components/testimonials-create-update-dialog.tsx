import { FormLoading, MainDialog } from '@/dashboard/components'
import { TestimonialsCreateUpdateForm } from './testimonials-create-update-form'
import { testimonialsInitialValues } from '../constants'
import { TestimonialsFormInterface, TestimonialsOpenCreateUpdateInterface } from '../interfaces'
import { useTestimonialsGetById, useTestimonialsUpdate } from '../hooks'
import { TestimonialsSchema } from '../validation'
import { useTranslation } from 'react-i18next'

export default function AddEditDialog({ open, onClose }: TestimonialsOpenCreateUpdateInterface) {
  const { t } = useTranslation()
  const { handleCreate, handleUpdate } = useTestimonialsUpdate()
  const { dataById, isLoadingByID } = useTestimonialsGetById(open.testimonialsId)
  const isAdd = open.isAdd

  return (
    <MainDialog<TestimonialsFormInterface>
      open={open.isOpen}
      onClose={onClose}
      isRefetching={isLoadingByID}
      state={isAdd ? 'add' : 'edit'}
      initialValues={
        isAdd
          ? testimonialsInitialValues
          : {
              id: open.testimonialsId,
              titleAr: dataById?.titleAr ?? '',
              titleEn: dataById?.titleEn ?? '',
              descriptionAr: dataById?.descriptionAr ?? '',
              descriptionEn: dataById?.descriptionEn ?? '',
              starNumber: dataById?.starNumber ?? 0,
              fileId: dataById?.avatar?.id ?? null,
              isActive: dataById?.isActive ?? true
            }
      }
      validationSchema={TestimonialsSchema}
      handleCreate={(values) =>
        handleCreate({
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          starNumber: values.starNumber,
          fileId: values.fileId,
          isActive: values.isActive
        })
      }
      handleUpdate={(values) =>
        handleUpdate({
          id: open.testimonialsId,
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          starNumber: values.starNumber,
          fileId: values.fileId,
          isActive: values.isActive
        })
      }
      id={!isAdd ? open.testimonialsId : undefined}
      dialogTitle={isAdd ? t('testimonials_add') : t('testimonials_edit')}
      maxWidth='3xl'
    >
      {() => (isLoadingByID ? <FormLoading /> : <TestimonialsCreateUpdateForm previewUrl={dataById?.avatar?.filePath} />)}
    </MainDialog>
  )
}
