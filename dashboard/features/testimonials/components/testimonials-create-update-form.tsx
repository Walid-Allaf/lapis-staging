import React from 'react'
import { ImageUpload, InputField, SwitchField } from '@/dashboard/components'
import { useTranslation } from 'react-i18next'

interface TestimonialsCreateUpdateFormProps {
  previewUrl?: string | null
}

export const TestimonialsCreateUpdateForm: React.FC<TestimonialsCreateUpdateFormProps> = ({ previewUrl }): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InputField name='titleAr' label={t('testimonials_title_ar')} dir='rtl' />
      <InputField name='titleEn' label={t('testimonials_title_en')} dir='ltr' />

      <div className='md:col-span-2'>
        <InputField name='descriptionAr' label={t('testimonials_description_ar')} dir='rtl' />
      </div>

      <div className='md:col-span-2'>
        <InputField name='descriptionEn' label={t('testimonials_description_en')} dir='ltr' />
      </div>
      <div className='md:col-span-2'>
          <ImageUpload name='fileId' label={t('image')} accept='*' previewUrl={previewUrl} />
      </div>

      <InputField name='starNumber' label={t('testimonials_star_number')} type='number' />

      <div className='md:col-span-2'>
        <SwitchField name='isActive' label={t('is_active')} />
      </div>
    </div>
  )
}
