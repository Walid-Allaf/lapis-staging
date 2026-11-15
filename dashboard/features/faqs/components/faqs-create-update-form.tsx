import React from 'react'
import { InputField, SwitchField } from '@/dashboard/components'
import { useTranslation } from 'react-i18next'

export const FaqsCreateUpdateForm: React.FC = (): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InputField name='questionAr' label={t('faq_question_ar')} dir='rtl' />
      <InputField name='questionEn' label={t('faq_question_en')} dir='ltr' />

      <div className='md:col-span-2'>
        <InputField name='answerAr' label={t('faq_answer_ar')} component='textarea' dir='rtl' />
      </div>

      <div className='md:col-span-2'>
        <InputField name='answerEn' label={t('faq_answer_en')} component='textarea' dir='ltr' />
      </div>

      <div className='md:col-span-2'>
        <SwitchField name='isActive' label={t('is_active')} />
      </div>
    </div>
  )
}
