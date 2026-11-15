import React from 'react'
import { useConfirmStore } from '@/dashboard/stores'
import { DataTable, ErrorMassage, MainContainer } from '@/dashboard/components'
import { BlogPostsCreateUpdateDialog, BlogPostsFilters } from './components'
import { BlogPostsFiltersRequestInterface, BlogPostsOpenCreateUpdateInterface } from './interfaces'
import { BlogPostsColumns, blogPostsCreateUpdateInitialValues, initialFiltersValues } from './constants'
import { useBlogPosts, useBlogPostsUpdate } from './hooks'

export const BlogPosts: React.FC = (): React.JSX.Element => {
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const [filters, setFilters] = React.useState<BlogPostsFiltersRequestInterface>(initialFiltersValues)
  const [openAddEdit, setOpenAddEdit] = React.useState<BlogPostsOpenCreateUpdateInterface['open']>(blogPostsCreateUpdateInitialValues)

  const { queryKey, data, isLoading, refetch, isRefetching, isError } = useBlogPosts(filters)
  const { handleDelete } = useBlogPostsUpdate()

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
      blogPostsId: id,
      isAdd: false,
      isOpen: true
    })
  }

  return (
    <MainContainer>
      <div className='px-2 pt-2'>
        <BlogPostsFilters
          isRefetching={isRefetching}
          onAdd={() => setOpenAddEdit({ isOpen: true, isAdd: true, blogPostsId: 0 })}
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
        columns={BlogPostsColumns({ handleDeleteConform, handleEdit })}
        enablePagination={{
          totalCount: data?.paging.totalRecords,
          handleChangePagination: () => refetch()
        }}
      />

      {openAddEdit.isOpen && (
        <BlogPostsCreateUpdateDialog
          open={openAddEdit}
          onClose={() => setOpenAddEdit(blogPostsCreateUpdateInitialValues)}
        />
      )}
    </MainContainer>
  )
}
