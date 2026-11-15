import { FormLoading, MainDialog } from '@/dashboard/components'
import { BlogPostsCreateUpdateForm } from './blog-posts-create-update-form'
import { blogPostsInitialValues } from '../constants'
import { BlogPostsFormInterface, BlogPostsOpenCreateUpdateInterface } from '../interfaces'
import { useBlogPostsGetById, useBlogPostsUpdate } from '../hooks'
import { BlogPostsSchema } from '../validation'
import { useTranslation } from 'react-i18next'

export default function AddEditDialog({ open, onClose }: BlogPostsOpenCreateUpdateInterface) {
  const { t } = useTranslation()
  const { handleCreate, handleUpdate } = useBlogPostsUpdate()
  const { dataById, isLoadingByID } = useBlogPostsGetById(open.blogPostsId)
  const isAdd = open.isAdd
  const specialistOption = dataById?.ourSpecialist
    ? {
        id: dataById.ourSpecialist.id,
        name: dataById.ourSpecialist.nameAr || dataById.ourSpecialist.nameEn
      }
    : null

  return (
    <MainDialog<BlogPostsFormInterface>
      open={open.isOpen}
      onClose={onClose}
      isRefetching={isLoadingByID}
      state={isAdd ? 'add' : 'edit'}
      initialValues={
        isAdd
          ? blogPostsInitialValues
          : {
              id: open.blogPostsId,
              titleAr: dataById?.titleAr ?? '',
              titleEn: dataById?.titleEn ?? '',
              summaryAr: dataById?.summaryAr ?? '',
              summaryEn: dataById?.summaryEn ?? '',
              contentAr: dataById?.contentAr ?? '',
              contentEn: dataById?.contentEn ?? '',
              ourSpecialistId: specialistOption,
              metaTitleAr: dataById?.metaTitleAr ?? '',
              metaTitleEn: dataById?.metaTitleEn ?? '',
              metaDescriptionAr: dataById?.metaDescriptionAr ?? '',
              metaDescriptionEn: dataById?.metaDescriptionEn ?? '',
              status: dataById?.status ?? 0,
              isFeatured: dataById?.isFeatured ?? false,
              order: dataById?.order ?? 0,
              fileId: dataById?.image?.id ?? null,
              isActive: dataById?.isActive ?? true
            }
      }
      validationSchema={BlogPostsSchema}
      handleCreate={(values) =>
        handleCreate({
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          summaryAr: values.summaryAr,
          summaryEn: values.summaryEn,
          contentAr: values.contentAr,
          contentEn: values.contentEn,
          ourSpecialistId: values.ourSpecialistId?.id ?? 0,
          metaTitleAr: values.metaTitleAr,
          metaTitleEn: values.metaTitleEn,
          metaDescriptionAr: values.metaDescriptionAr,
          metaDescriptionEn: values.metaDescriptionEn,
          status: values.status,
          isFeatured: values.isFeatured,
          order: values.order,
          fileId: values.fileId,
          isActive: values.isActive
        })
      }
      handleUpdate={(values) =>
        handleUpdate({
          id: open.blogPostsId,
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          summaryAr: values.summaryAr,
          summaryEn: values.summaryEn,
          contentAr: values.contentAr,
          contentEn: values.contentEn,
          ourSpecialistId: values.ourSpecialistId?.id ?? 0,
          metaTitleAr: values.metaTitleAr,
          metaTitleEn: values.metaTitleEn,
          metaDescriptionAr: values.metaDescriptionAr,
          metaDescriptionEn: values.metaDescriptionEn,
          status: values.status,
          isFeatured: values.isFeatured,
          order: values.order,
          fileId: values.fileId,
          isActive: values.isActive
        })
      }
      id={!isAdd ? open.blogPostsId : undefined}
      dialogTitle={isAdd ? t('blog_posts_add') : t('blog_posts_edit')}
      maxWidth='5xl'
    >
      {() => (isLoadingByID ? <FormLoading /> : <BlogPostsCreateUpdateForm previewUrl={dataById?.image?.filePath} />)}
    </MainDialog>
  )
}
