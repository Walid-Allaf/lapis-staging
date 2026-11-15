import React from 'react'
import { AsyncAutocompleteField, ImageUpload, InputField, RichTextField, SwitchField } from '@/dashboard/components'
import { ourSpecialistsEndpoints } from '@/dashboard/features/our-specialists/services'
import type { OurSpecialistsInterface } from '@/dashboard/features/our-specialists/interfaces'
import { useTranslation } from 'react-i18next'

interface BlogPostsCreateUpdateFormProps {
  previewUrl?: string | null
}

export const BlogPostsCreateUpdateForm: React.FC<BlogPostsCreateUpdateFormProps> = ({ previewUrl }): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InputField name='titleAr' label={t('blog_posts_title_ar')} dir='rtl' />
      <InputField name='titleEn' label={t('blog_posts_title_en')} dir='ltr' />

      <InputField name='summaryAr' label={t('blog_posts_summary_ar')} component='textarea' dir='rtl' />
      <InputField name='summaryEn' label={t('blog_posts_summary_en')} component='textarea' dir='ltr' />

      <AsyncAutocompleteField
        name='ourSpecialistId'
        label={t('blog_posts_our_specialist')}
        fetchParams={{
          endpoint: ourSpecialistsEndpoints.getAll,
          queryKey: 'our-specialists',
          itemsKey: 'data',
          searchParam: 'search'
        }}
        formatOptions={(item) => {
          const specialist = item as OurSpecialistsInterface

          return {
            id: specialist.id,
            name: specialist.nameAr || specialist.nameEn
          }
        }}
      />
      <InputField name='status' label={t('blog_posts_status')} type='number' />
      <InputField name='order' label={t('order')} type='number' />

      <ImageUpload name='fileId' label={t('image')} accept='*' previewUrl={previewUrl} />

      <div className='md:col-span-2'>
        <RichTextField name='contentAr' label={t('blog_posts_content_ar')} dir='rtl' />
      </div>

      <div className='md:col-span-2'>
        <RichTextField name='contentEn' label={t('blog_posts_content_en')} dir='ltr' />
      </div>

      <InputField name='metaTitleAr' label={t('blog_posts_meta_title_ar')} dir='rtl' />
      <InputField name='metaTitleEn' label={t('blog_posts_meta_title_en')} dir='ltr' />
      <InputField name='metaDescriptionAr' label={t('blog_posts_meta_description_ar')} component='textarea' dir='rtl' />
      <InputField name='metaDescriptionEn' label={t('blog_posts_meta_description_en')} component='textarea' dir='ltr' />

      <div className='md:col-span-2 flex flex-col gap-3'>
        <SwitchField name='isFeatured' label={t('blog_posts_is_featured')} />
        <SwitchField name='isActive' label={t('is_active')} />
      </div>
    </div>
  )
}
