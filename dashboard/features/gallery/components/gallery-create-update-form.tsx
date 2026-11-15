import React from 'react'
import { ImageUpload, InputField, SwitchField } from '@/dashboard/components'
import { useTranslation } from 'react-i18next'

interface GalleryCreateUpdateFormProps {
  beforePreviewUrl?: string | null
  afterPreviewUrl?: string | null
}

export const GalleryCreateUpdateForm: React.FC<GalleryCreateUpdateFormProps> = ({ beforePreviewUrl, afterPreviewUrl }): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InputField name='titleAr' label={t('gallery_title_ar')} dir='rtl' />
      <InputField name='titleEn' label={t('gallery_title_en')} dir='ltr' />

      <div className='md:col-span-2'>
        <InputField name='descriptionAr' label={t('gallery_description_ar')} component='textarea' dir='rtl' />
      </div>

      <div className='md:col-span-2'>
        <InputField name='descriptionEn' label={t('gallery_description_en')} component='textarea' dir='ltr' />
      </div>

      <ImageUpload name='beforeFileId' label={t('gallery_before_image')} accept='*' previewUrl={beforePreviewUrl} />
      <ImageUpload name='afterFileId' label={t('gallery_after_image')} accept='*' previewUrl={afterPreviewUrl} />

      <div className='md:col-span-2'>
        <SwitchField name='isActive' label={t('is_active')} />
      </div>
    </div>
  )
}
