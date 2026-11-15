import { FormLoading, MainDialog } from '@/dashboard/components'
import { GalleryCreateUpdateForm } from './gallery-create-update-form'
import { galleryInitialValues } from '../constants'
import { GalleryFormInterface, GalleryOpenCreateUpdateInterface } from '../interfaces'
import { useGalleryGetById, useGalleryUpdate } from '../hooks'
import { GallerySchema } from '../validation'
import { useTranslation } from 'react-i18next'

export default function AddEditDialog({ open, onClose }: GalleryOpenCreateUpdateInterface) {
  const { t } = useTranslation()
  const { handleCreate, handleUpdate } = useGalleryUpdate()
  const { dataById, isLoadingByID } = useGalleryGetById(open.galleryId)
  const isAdd = open.isAdd

  return (
    <MainDialog<GalleryFormInterface>
      open={open.isOpen}
      onClose={onClose}
      isRefetching={isLoadingByID}
      state={isAdd ? 'add' : 'edit'}
      initialValues={
        isAdd
          ? galleryInitialValues
          : {
              id: open.galleryId,
              titleAr: dataById?.titleAr ?? '',
              titleEn: dataById?.titleEn ?? '',
              descriptionAr: dataById?.descriptionAr ?? '',
              descriptionEn: dataById?.descriptionEn ?? '',
              beforeFileId: dataById?.beforeImage?.id ?? null,
              afterFileId: dataById?.afterImage?.id ?? null,
              isActive: dataById?.isActive ?? true
            }
      }
      validationSchema={GallerySchema}
      handleCreate={(values) =>
        handleCreate({
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          beforeFileId: values.beforeFileId,
          afterFileId: values.afterFileId,
          isActive: values.isActive
        })
      }
      handleUpdate={(values) =>
        handleUpdate({
          id: open.galleryId,
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          beforeFileId: values.beforeFileId,
          afterFileId: values.afterFileId,
          isActive: values.isActive
        })
      }
      id={!isAdd ? open.galleryId : undefined}
      dialogTitle={isAdd ? t('gallery_add') : t('gallery_edit')}
      maxWidth='3xl'
    >
      {() =>
        isLoadingByID ? (
          <FormLoading />
        ) : (
          <GalleryCreateUpdateForm
            beforePreviewUrl={dataById?.beforeImage?.filePath}
            afterPreviewUrl={dataById?.afterImage?.filePath}
          />
        )
      }
    </MainDialog>
  )
}
