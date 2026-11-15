import React from 'react'
import { ImageUpload, InputField, SwitchField } from '@/dashboard/components'
import { useTranslation } from 'react-i18next'

interface OurSpecialistsCreateUpdateFormProps {
  previewUrl?: string | null
}

export const OurSpecialistsCreateUpdateForm: React.FC<OurSpecialistsCreateUpdateFormProps> = ({ previewUrl }): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InputField name='nameAr' label={t('our_specialists_name_ar')} dir='rtl' />
      <InputField name='nameEn' label={t('our_specialists_name_en')} dir='ltr' />

      <InputField name='specialistAr' label={t('our_specialists_specialist_ar')} dir='rtl' />
      <InputField name='specialistEn' label={t('our_specialists_specialist_en')} dir='ltr' />

      <div className='md:col-span-2'>
        <InputField name='descriptionAr' label={t('our_specialists_description_ar')} dir='rtl' />
      </div>
      <div className='md:col-span-2'>
        <InputField name='descriptionEn' label={t('our_specialists_description_en')} dir='ltr' />
      </div>
      <div className='md:col-span-2'>
          <ImageUpload name='fileId' label={t('image')} accept='*' previewUrl={previewUrl} />
      </div>

      <div className='md:col-span-2'>
        <SwitchField name='isActive' label={t('is_active')} />
      </div>
    </div>
  )
}
