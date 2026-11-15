import { getAssetUrl } from '@/dashboard/api/urls'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@/dashboard/components'
import { BlogPostsInterface } from '../interfaces'

interface ColumnsProps {
  handleDeleteConform: (id: number) => void
  handleEdit: (id: number) => void
}

const resolveImageSrc = getAssetUrl

const Columns = ({ handleDeleteConform, handleEdit }: ColumnsProps): ColumnDef<BlogPostsInterface>[] => {
  const { t } = useTranslation()

  return [
    {
      id: 'index',
      header: '#',
      size: 70,
      enableHiding: false,
      cell: ({ row }) => row.index + 1
    },
    {
      accessorKey: 'image',
      header: t('image'),
      size: 100,
      cell: ({ row }) => {
        const image = row.original.image
        const imageSrc = resolveImageSrc(image?.filePath)

        return imageSrc ? (
          <img
            src={imageSrc}
            alt={row.original.titleEn}
            className='h-10 w-10 rounded-md object-cover'
          />
        ) : (
          <span>-</span>
        )
      }
    },
    {
      accessorKey: 'titleAr',
      header: t('blog_posts_title_ar'),
      size: 220
    },
    {
      accessorKey: 'summaryAr',
      header: t('blog_posts_summary_ar'),
      size: 300
    },
    {
      accessorKey: 'ourSpecialist.nameAr',
      header: t('blog_posts_our_specialist'),
      size: 220,
      cell: ({ row }) => row.original.ourSpecialist?.nameAr ?? '-'
    },
    {
      accessorKey: 'status',
      header: t('blog_posts_status'),
      size: 120
    },
    {
      accessorKey: 'createdAt',
      header: t('created_at'),
      size: 180,
      cell: ({ row }) => {
        const createdAt = row.original.createdAt

        return createdAt ? new Date(createdAt).toLocaleDateString() : '-'
      }
    },
    {
      accessorKey: 'isActive',
      header: t('status'),
      size: 120,
      cell: ({ row }) => {
        const isActive = row.original.isActive

        return <span>{isActive ? t('active') : t('inactive')}</span>
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      header: t('actions'),
      cell: ({ row }) => {
        const blogPost = row.original

        return (
          <div className='flex gap-1'>
            <IconButton
              handleClick={() => handleEdit(blogPost.id)}
              icon={<Edit className='size-4' />}
              label={t('edit')}
            />
            <IconButton
              handleClick={() => handleDeleteConform(blogPost.id)}
              icon={<Trash2 className='size-4 text-destructive' />}
              label={t('delete')}
            />
          </div>
        )
      }
    }
  ]
}

export default Columns
