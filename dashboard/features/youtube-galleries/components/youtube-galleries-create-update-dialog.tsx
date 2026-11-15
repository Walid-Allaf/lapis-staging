import { FormLoading, MainDialog } from '@/dashboard/components'
import { YouTubeGalleriesCreateUpdateForm } from './youtube-galleries-create-update-form'
import { youtubeGalleriesInitialValues } from '../constants'
import { YouTubeGalleriesFormInterface, YouTubeGalleriesOpenCreateUpdateInterface } from '../interfaces'
import { useYouTubeGalleriesGetById, useYouTubeGalleriesUpdate } from '../hooks'
import { YouTubeGalleriesSchema } from '../validation'
import { useTranslation } from 'react-i18next'

export default function AddEditDialog({ open, onClose }: YouTubeGalleriesOpenCreateUpdateInterface) {
  const { t } = useTranslation()
  const { handleCreate, handleUpdate } = useYouTubeGalleriesUpdate()
  const { dataById, isLoadingByID } = useYouTubeGalleriesGetById(open.youtubeGalleriesId)
  const isAdd = open.isAdd

  return (
    <MainDialog<YouTubeGalleriesFormInterface>
      open={open.isOpen}
      onClose={onClose}
      isRefetching={isLoadingByID}
      state={isAdd ? 'add' : 'edit'}
      initialValues={
        isAdd
          ? youtubeGalleriesInitialValues
          : {
              id: open.youtubeGalleriesId,
              titleAr: dataById?.titleAr ?? '',
              titleEn: dataById?.titleEn ?? '',
              descriptionAr: dataById?.descriptionAr ?? '',
              descriptionEn: dataById?.descriptionEn ?? '',
              videoUrl: dataById?.videoUrl ?? '',
              isActive: dataById?.isActive ?? true
            }
      }
      validationSchema={YouTubeGalleriesSchema}
      handleCreate={(values) =>
        handleCreate({
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          videoUrl: values.videoUrl,
          isActive: values.isActive
        })
      }
      handleUpdate={(values) =>
        handleUpdate({
          id: open.youtubeGalleriesId,
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          videoUrl: values.videoUrl,
          isActive: values.isActive
        })
      }
      id={!isAdd ? open.youtubeGalleriesId : undefined}
      dialogTitle={isAdd ? t('youtube_galleries_add') : t('youtube_galleries_edit')}
      maxWidth='3xl'
    >
      {() => (isLoadingByID ? <FormLoading /> : <YouTubeGalleriesCreateUpdateForm />)}
    </MainDialog>
  )
}
