import { FormLoading, MainDialog } from '@/dashboard/components'
import { OurSpecialistsCreateUpdateForm } from './our-specialists-create-update-form'
import { ourSpecialistsInitialValues } from '../constants'
import { OurSpecialistsFormInterface, OurSpecialistsOpenCreateUpdateInterface } from '../interfaces'
import { useOurSpecialistsGetById, useOurSpecialistsUpdate } from '../hooks'
import { OurSpecialistsSchema } from '../validation'
import { useTranslation } from 'react-i18next'

export default function AddEditDialog({ open, onClose }: OurSpecialistsOpenCreateUpdateInterface) {
  const { t } = useTranslation()
  const { handleCreate, handleUpdate } = useOurSpecialistsUpdate()
  const { dataById, isLoadingByID } = useOurSpecialistsGetById(open.ourSpecialistsId)
  const isAdd = open.isAdd

  return (
    <MainDialog<OurSpecialistsFormInterface>
      open={open.isOpen}
      onClose={onClose}
      isRefetching={isLoadingByID}
      state={isAdd ? 'add' : 'edit'}
      initialValues={
        isAdd
          ? ourSpecialistsInitialValues
          : {
              id: open.ourSpecialistsId,
              nameAr: dataById?.nameAr ?? '',
              nameEn: dataById?.nameEn ?? '',
              descriptionAr: dataById?.descriptionAr ?? '',
              descriptionEn: dataById?.descriptionEn ?? '',
              specialistAr: dataById?.specialistAr ?? '',
              specialistEn: dataById?.specialistEn ?? '',
              fileId: dataById?.image?.id ?? null,
              isActive: dataById?.isActive ?? true
            }
      }
      validationSchema={OurSpecialistsSchema}
      handleCreate={(values) =>
        handleCreate({
          nameAr: values.nameAr,
          nameEn: values.nameEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          specialistAr: values.specialistAr,
          specialistEn: values.specialistEn,
          fileId: values.fileId,
          isActive: values.isActive
        })
      }
      handleUpdate={(values) =>
        handleUpdate({
          id: open.ourSpecialistsId,
          nameAr: values.nameAr,
          nameEn: values.nameEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          specialistAr: values.specialistAr,
          specialistEn: values.specialistEn,
          fileId: values.fileId,
          isActive: values.isActive
        })
      }
      id={!isAdd ? open.ourSpecialistsId : undefined}
      dialogTitle={isAdd ? t('our_specialists_add') : t('our_specialists_edit')}
      maxWidth='3xl'
    >
      {() => (isLoadingByID ? <FormLoading /> : <OurSpecialistsCreateUpdateForm previewUrl={dataById?.image?.filePath} />)}
    </MainDialog>
  )
}
