import { ColumnDef } from '@tanstack/react-table'
import { Edit, ExternalLink, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@/dashboard/components'
import { YouTubeGalleriesInterface } from '../interfaces'

interface ColumnsProps {
  handleDeleteConform: (id: number) => void
  handleEdit: (id: number) => void
}

const Columns = ({ handleDeleteConform, handleEdit }: ColumnsProps): ColumnDef<YouTubeGalleriesInterface>[] => {
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
      accessorKey: 'titleAr',
      header: t('youtube_galleries_title_ar'),
      size: 220
    },
    {
      accessorKey: 'descriptionAr',
      header: t('youtube_galleries_description_ar'),
      size: 320
    },
    {
      accessorKey: 'videoUrl',
      header: t('youtube_galleries_video_url'),
      size: 220,
      cell: ({ row }) => {
        const videoUrl = row.original.videoUrl

        return videoUrl ? (
          <a
            href={videoUrl}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline'
          >
            <ExternalLink className='size-4' />
            {t('show')}
          </a>
        ) : (
          '-'
        )
      }
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
        const youtubeGallery = row.original

        return (
          <div className='flex gap-1'>
            <IconButton
              handleClick={() => handleEdit(youtubeGallery.id)}
              icon={<Edit className='size-4' />}
              label={t('edit')}
            />
            <IconButton
              handleClick={() => handleDeleteConform(youtubeGallery.id)}
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
