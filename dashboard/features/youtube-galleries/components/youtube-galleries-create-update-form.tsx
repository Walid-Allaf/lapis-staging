import React from 'react'
import { InputField, SwitchField } from '@/dashboard/components'
import { useTranslation } from 'react-i18next'

export const YouTubeGalleriesCreateUpdateForm: React.FC = (): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InputField name='titleAr' label={t('youtube_galleries_title_ar')} dir='rtl' />
      <InputField name='titleEn' label={t('youtube_galleries_title_en')} dir='ltr' />

      <div className='md:col-span-2'>
        <InputField name='descriptionAr' label={t('youtube_galleries_description_ar')} component='textarea' dir='rtl' />
      </div>

      <div className='md:col-span-2'>
        <InputField name='descriptionEn' label={t('youtube_galleries_description_en')} component='textarea' dir='ltr' />
      </div>

      <div className='md:col-span-2'>
        <InputField name='videoUrl' label={t('youtube_galleries_video_url')} dir='ltr' />
      </div>

      <div className='md:col-span-2'>
        <SwitchField name='isActive' label={t('is_active')} />
      </div>
    </div>
  )
}
