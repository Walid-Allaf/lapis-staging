import React from 'react'
import { useConfirmStore } from '@/dashboard/stores'
import { DataTable, ErrorMassage, MainContainer } from '@/dashboard/components'
import { ServicesCreateUpdateDialog, ServicesFilters } from './components'
import { ServicesOpenCreateUpdateInterface, ServicesFiltersRequestInterface } from './interfaces'
import { useServices, useServicesUpdate } from './hooks'
import { ServicesColumns, servicesCreateUpdateInitialValues, initialFiltersValues } from './constants'

export const Services: React.FC = (): React.JSX.Element => {
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const [filters, setFilters] = React.useState<ServicesFiltersRequestInterface>(initialFiltersValues)
  const [openAddEdit, setOpenAddEdit] = React.useState<ServicesOpenCreateUpdateInterface['open']>(servicesCreateUpdateInitialValues)

  const { queryKey, data, isLoading, refetch, isRefetching, isError } = useServices(filters)
  const { handleDelete } = useServicesUpdate()

  const handleDeleteConform = (id: number) => {
    setConfirm({
      isOpen: true,
      message: 'هل أنت متأكد من حذف العنصر ؟',
      onConfirm: () => { handleDelete(id) },
      type: 'error'
    })
  }

  const handleEdit = (id: number) => {
    setOpenAddEdit({
      servicesId: id,
      isAdd: false,
      isOpen: true
    })
  }
  return (
    <MainContainer>
      <div className={'px-2 pt-2'}>
        <ServicesFilters
          isRefetching={isRefetching}
          onAdd={() => setOpenAddEdit({ isOpen: true, isAdd: true, servicesId: 0 })}
          submit={async function (values): Promise<void> {
            await setFilters(values)
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
        columns={ServicesColumns({ handleDeleteConform, handleEdit })}
        enablePagination={{
          totalCount: data?.paging.totalRecords,
          handleChangePagination: () => refetch()
        }}
      />


      {openAddEdit.isOpen && (
        <ServicesCreateUpdateDialog
          open={openAddEdit}
          onClose={() => setOpenAddEdit(servicesCreateUpdateInitialValues)}
        />
      )}

    </MainContainer>
  )
}

