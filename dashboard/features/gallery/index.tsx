import React from 'react'
import { useConfirmStore } from '@/dashboard/stores'
import { DataTable, ErrorMassage, MainContainer } from '@/dashboard/components'
import { GalleryCreateUpdateDialog, GalleryFilters } from './components'
import { GalleryFiltersRequestInterface, GalleryOpenCreateUpdateInterface } from './interfaces'
import { GalleryColumns, galleryCreateUpdateInitialValues, initialFiltersValues } from './constants'
import { useGallery, useGalleryUpdate } from './hooks'

export const Gallery: React.FC = (): React.JSX.Element => {
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const [filters, setFilters] = React.useState<GalleryFiltersRequestInterface>(initialFiltersValues)
  const [openAddEdit, setOpenAddEdit] = React.useState<GalleryOpenCreateUpdateInterface['open']>(galleryCreateUpdateInitialValues)

  const { queryKey, data, isLoading, refetch, isRefetching, isError } = useGallery(filters)
  const { handleDelete } = useGalleryUpdate()

  const handleDeleteConform = (id: number) => {
    setConfirm({
      isOpen: true,
      message: 'Are you sure you want to delete this item?',
      onConfirm: () => {
        handleDelete(id)
      },
      type: 'error'
    })
  }

  const handleEdit = (id: number) => {
    setOpenAddEdit({
      galleryId: id,
      isAdd: false,
      isOpen: true
    })
  }

  return (
    <MainContainer>
      <div className='px-2 pt-2'>
        <GalleryFilters
          isRefetching={isRefetching}
          onAdd={() => setOpenAddEdit({ isOpen: true, isAdd: true, galleryId: 0 })}
          submit={(values): void => {
            setFilters(values)
            refetch()
          }}
        />
      </div>
      {isError && <ErrorMassage />}

      <DataTable
        tableId={queryKey}
        isLoading={isLoading}
        isRefetching={isRefetching}
        rows={
          data?.data?.map((ele, i: number) => ({
            ...ele,
            index: i + 1
          })) || []
        }
        columns={GalleryColumns({ handleDeleteConform, handleEdit })}
        enablePagination={{
          totalCount: data?.paging.totalRecords,
          handleChangePagination: () => refetch()
        }}
      />

      {openAddEdit.isOpen && (
        <GalleryCreateUpdateDialog
          open={openAddEdit}
          onClose={() => setOpenAddEdit(galleryCreateUpdateInitialValues)}
        />
      )}
    </MainContainer>
  )
}
