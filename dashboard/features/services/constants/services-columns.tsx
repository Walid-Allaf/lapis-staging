import { getAssetUrl } from '@/dashboard/api/urls'
import {Edit, Trash2} from 'lucide-react'
import {ColumnDef} from '@tanstack/react-table'
import {useTranslation} from 'react-i18next'
import {IconButton} from '@/dashboard/components'
import { ServicesInterface } from '../interfaces'

interface ColumnsProps {
    handleDeleteConform: (id: number) => void
    handleEdit: (id: number) => void
}

const Columns = ({handleDeleteConform, handleEdit}: ColumnsProps): ColumnDef<ServicesInterface>[] => {
    const {t} = useTranslation()

    return [
        {
            id: 'index',
            header: 'م',
            size: 70,
            enableHiding: false,
            cell: ({row}) => row.index + 1
        },
        {
            accessorKey: 'avatar',
            header: t('image'),
            size: 100,
            cell: ({row}) => {
                const avatar = row.original.avatar

                return avatar?.filePath ? (
                    <img
                        src={getAssetUrl(avatar.filePath)}
                        alt={row.original.nameEn}
                        className='h-10 w-10 rounded-md object-cover'
                    />
                ) : (
                    <span>-</span>
                )
            }
        },
        {
            accessorKey: 'nameAr',
            header: t('service_name_ar'),
            size: 200
        },
        {
            accessorKey: 'nameEn',
            header: t('service_name_en'),
            size: 200
        },
        {
            accessorKey: 'simpleDescriptionAr',
            header: t('simple_description_ar'),
            size: 250
        },
        {
            accessorKey: 'simpleDescriptionEn',
            header: t('simple_description_en'),
            size: 250
        },
        {
            accessorKey: 'order',
            header: t('order'),
            size: 100
        },
        {
            accessorKey: 'isActive',
            header: t('status'),
            size: 120,
            cell: ({row}) => {
                const isActive = row.original.isActive

                return (
                    <span>
            {isActive ? t('active') : t('inactive')}
          </span>
                )
            }
        },
        {
            accessorKey: 'createdAt',
            header: t('created_at'),
            size: 180,
            cell: ({row}) => {
                const createdAt = row.original.createdAt

                return createdAt ? new Date(createdAt).toLocaleDateString() : '-'
            }
        },
        {
            id: 'actions',
            enableHiding: false,
            header: t('actions'),
            cell: ({row}) => {
                const service = row.original

                return (
                    <div className=' flex gap-1'>
                        <IconButton handleClick={() => {
                            handleEdit(service.id)
                        }} icon={<Edit className='size-4'/>} label={t('edit')}/>
                        <IconButton handleClick={() => {
                            handleDeleteConform(service.id)
                        }} icon={<Trash2 className='size-4 text-destructive'/>} label={t('delete')}/>
                    </div>
                )
            }
        }
    ]
}

export default Columns
