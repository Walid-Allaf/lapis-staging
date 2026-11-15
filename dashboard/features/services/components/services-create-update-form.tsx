import React from 'react'
import {ImageUpload, InputField, SwitchField} from '@/dashboard/components'
import {useTranslation} from 'react-i18next'

interface ServicesCreateUpdateFormProps {
    previewUrl?: string | null
}

export const ServicesCreateUpdateForm: React.FC<ServicesCreateUpdateFormProps> = ({previewUrl}): React.JSX.Element => {
    const {t} = useTranslation()

    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <InputField name={'nameAr'} label={t('service_name_ar')} dir='rtl'/>
            <InputField name={'nameEn'} label={t('service_name_en')} dir='ltr'/>

            <InputField name={'simpleDescriptionAr'} label={t('simple_description_ar')} dir='rtl'/>
            <InputField name={'simpleDescriptionEn'} label={t('simple_description_en')} dir='ltr'/>

            <div className='md:col-span-2'>
                <InputField name={'descriptionAr'} label={t('description_ar')} dir='rtl'/>
            </div>

            <div className='md:col-span-2'>
                <InputField name={'descriptionEn'} label={t('description_en')} dir='ltr'/>
            </div>
            <div className='md:col-span-2'>
                <ImageUpload name={'fileId'} label={t('image')} accept={'*'} previewUrl={previewUrl}/>
            </div>
            <InputField name={'order'} label={t('order')} type='number'/>

            <div className='md:col-span-2'>
                <SwitchField name={'isActive'} label={t('is_active')}/>
            </div>
        </div>
    )
}
