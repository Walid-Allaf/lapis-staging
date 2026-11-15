import React from 'react'
import { useConfirmStore } from '@/dashboard/stores'
import { DataTable, ErrorMassage, MainContainer } from '@/dashboard/components'
import { TestimonialsCreateUpdateDialog, TestimonialsFilters } from './components'
import { TestimonialsFiltersRequestInterface, TestimonialsOpenCreateUpdateInterface } from './interfaces'
import { TestimonialsColumns, testimonialsCreateUpdateInitialValues, initialFiltersValues } from './constants'
import { useTestimonials, useTestimonialsUpdate } from './hooks'

export const Testimonials: React.FC = (): React.JSX.Element => {
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const [filters, setFilters] = React.useState<TestimonialsFiltersRequestInterface>(initialFiltersValues)
  const [openAddEdit, setOpenAddEdit] = React.useState<TestimonialsOpenCreateUpdateInterface['open']>(testimonialsCreateUpdateInitialValues)

  const { queryKey, data, isLoading, refetch, isRefetching, isError } = useTestimonials(filters)
  const { handleDelete } = useTestimonialsUpdate()

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
      testimonialsId: id,
      isAdd: false,
      isOpen: true
    })
  }

  return (
    <MainContainer>
      <div className='px-2 pt-2'>
        <TestimonialsFilters
          isRefetching={isRefetching}
          onAdd={() => setOpenAddEdit({ isOpen: true, isAdd: true, testimonialsId: 0 })}
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
        columns={TestimonialsColumns({ handleDeleteConform, handleEdit })}
        enablePagination={{
          totalCount: data?.paging.totalRecords,
          handleChangePagination: () => refetch()
        }}
      />

      {openAddEdit.isOpen && (
        <TestimonialsCreateUpdateDialog
          open={openAddEdit}
          onClose={() => setOpenAddEdit(testimonialsCreateUpdateInitialValues)}
        />
      )}
    </MainContainer>
  )
}
