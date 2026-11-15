import React from 'react'
import { useConfirmStore } from '@/dashboard/stores'
import { DataTable, ErrorMassage, MainContainer } from '@/dashboard/components'
import { FaqsCreateUpdateDialog, FaqsFilters } from './components'
import { FaqsFiltersRequestInterface, FaqsOpenCreateUpdateInterface } from './interfaces'
import { FaqsColumns, faqsCreateUpdateInitialValues, initialFiltersValues } from './constants'
import { useFaqs, useFaqsUpdate } from './hooks'

export const Faqs: React.FC = (): React.JSX.Element => {
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const [filters, setFilters] = React.useState<FaqsFiltersRequestInterface>(initialFiltersValues)
  const [openAddEdit, setOpenAddEdit] = React.useState<FaqsOpenCreateUpdateInterface['open']>(faqsCreateUpdateInitialValues)

  const { queryKey, data, isLoading, refetch, isRefetching, isError } = useFaqs(filters)
  const { handleDelete } = useFaqsUpdate()

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
      faqsId: id,
      isAdd: false,
      isOpen: true
    })
  }

  return (
    <MainContainer>
      <div className='px-2 pt-2'>
        <FaqsFilters
          isRefetching={isRefetching}
          onAdd={() => setOpenAddEdit({ isOpen: true, isAdd: true, faqsId: 0 })}
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
        columns={FaqsColumns({ handleDeleteConform, handleEdit })}
        enablePagination={{
          totalCount: data?.paging.totalRecords,
          handleChangePagination: () => refetch()
        }}
      />

      {openAddEdit.isOpen && (
        <FaqsCreateUpdateDialog
          open={openAddEdit}
          onClose={() => setOpenAddEdit(faqsCreateUpdateInitialValues)}
        />
      )}
    </MainContainer>
  )
}
