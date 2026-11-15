import React from 'react'
import { useConfirmStore } from '@/dashboard/stores'
import { DataTable, ErrorMassage, MainContainer } from '@/dashboard/components'
import { YouTubeGalleriesCreateUpdateDialog, YouTubeGalleriesFilters } from './components'
import { YouTubeGalleriesFiltersRequestInterface, YouTubeGalleriesOpenCreateUpdateInterface } from './interfaces'
import { YouTubeGalleriesColumns, youtubeGalleriesCreateUpdateInitialValues, initialFiltersValues } from './constants'
import { useYouTubeGalleries, useYouTubeGalleriesUpdate } from './hooks'

export const YouTubeGalleries: React.FC = (): React.JSX.Element => {
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const [filters, setFilters] = React.useState<YouTubeGalleriesFiltersRequestInterface>(initialFiltersValues)
  const [openAddEdit, setOpenAddEdit] = React.useState<YouTubeGalleriesOpenCreateUpdateInterface['open']>(youtubeGalleriesCreateUpdateInitialValues)

  const { queryKey, data, isLoading, refetch, isRefetching, isError } = useYouTubeGalleries(filters)
  const { handleDelete } = useYouTubeGalleriesUpdate()

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
      youtubeGalleriesId: id,
      isAdd: false,
      isOpen: true
    })
  }

  return (
    <MainContainer>
      <div className='px-2 pt-2'>
        <YouTubeGalleriesFilters
          isRefetching={isRefetching}
          onAdd={() => setOpenAddEdit({ isOpen: true, isAdd: true, youtubeGalleriesId: 0 })}
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
        columns={YouTubeGalleriesColumns({ handleDeleteConform, handleEdit })}
        enablePagination={{
          totalCount: data?.paging.totalRecords,
          handleChangePagination: () => refetch()
        }}
      />

      {openAddEdit.isOpen && (
        <YouTubeGalleriesCreateUpdateDialog
          open={openAddEdit}
          onClose={() => setOpenAddEdit(youtubeGalleriesCreateUpdateInitialValues)}
        />
      )}
    </MainContainer>
  )
}
