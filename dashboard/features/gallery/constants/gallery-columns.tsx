import { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@/dashboard/components'
import { GalleryInterface } from '../interfaces'

interface ColumnsProps {
  handleDeleteConform: (id: number) => void
  handleEdit: (id: number) => void
}

const Columns = ({ handleDeleteConform, handleEdit }: ColumnsProps): ColumnDef<GalleryInterface>[] => {
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
      header: t('gallery_title_ar'),
      size: 220
    },
    {
      accessorKey: 'titleEn',
      header: t('gallery_title_en'),
      size: 220
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
        const gallery = row.original

        return (
          <div className='flex gap-1'>
            <IconButton
              handleClick={() => handleEdit(gallery.id)}
              icon={<Edit className='size-4' />}
              label={t('edit')}
            />
            <IconButton
              handleClick={() => handleDeleteConform(gallery.id)}
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
