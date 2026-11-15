import React from 'react'
import { useConfirmStore } from '@/dashboard/stores'
import { DataTable, ErrorMassage, MainContainer } from '@/dashboard/components'
import { OurSpecialistsCreateUpdateDialog, OurSpecialistsFilters } from './components'
import { OurSpecialistsFiltersRequestInterface, OurSpecialistsOpenCreateUpdateInterface } from './interfaces'
import { OurSpecialistsColumns, ourSpecialistsCreateUpdateInitialValues, initialFiltersValues } from './constants'
import { useOurSpecialists, useOurSpecialistsUpdate } from './hooks'

export const OurSpecialists: React.FC = (): React.JSX.Element => {
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const [filters, setFilters] = React.useState<OurSpecialistsFiltersRequestInterface>(initialFiltersValues)
  const [openAddEdit, setOpenAddEdit] = React.useState<OurSpecialistsOpenCreateUpdateInterface['open']>(ourSpecialistsCreateUpdateInitialValues)

  const { queryKey, data, isLoading, refetch, isRefetching, isError } = useOurSpecialists(filters)
  const { handleDelete } = useOurSpecialistsUpdate()

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
      ourSpecialistsId: id,
      isAdd: false,
      isOpen: true
    })
  }

  return (
    <MainContainer>
      <div className='px-2 pt-2'>
        <OurSpecialistsFilters
          isRefetching={isRefetching}
          onAdd={() => setOpenAddEdit({ isOpen: true, isAdd: true, ourSpecialistsId: 0 })}
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
        columns={OurSpecialistsColumns({ handleDeleteConform, handleEdit })}
        enablePagination={{
          totalCount: data?.paging.totalRecords,
          handleChangePagination: () => refetch()
        }}
      />

      {openAddEdit.isOpen && (
        <OurSpecialistsCreateUpdateDialog
          open={openAddEdit}
          onClose={() => setOpenAddEdit(ourSpecialistsCreateUpdateInitialValues)}
        />
      )}
    </MainContainer>
  )
}
