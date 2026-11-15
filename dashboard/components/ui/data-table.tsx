import * as React from 'react'
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/dashboard/components/shadcn-ui/table'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Input } from '@/dashboard/components/shadcn-ui/input'
import { Checkbox } from '@/dashboard/components/shadcn-ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/dashboard/components/shadcn-ui/dropdown-menu'
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Loader2
} from 'lucide-react'
import { getPageNumber, getPageSize, setPageNumber, setPageSize } from '@/dashboard/utils'
import { usePathname } from 'next/navigation'
import { LinearLoading } from '@/dashboard/components'
import { toast } from 'sonner'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function CustomPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center space-x-1" dir="ltr">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-6 p-0"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-sm text-muted-foreground">...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="h-8 w-6 p-0"
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-6 p-0"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

interface DataGridProps<T extends { id?: string | number }> {
  columns: ColumnDef<T>[]
  rows: Array<T>
  selection?: boolean
  minHeight?: string
  isLoading: boolean
  isRefetching: boolean
  tableId: string
  onRowSelection?: (newRow: (string | number)[]) => void
  highlightRowIds?: Array<string | number>
  rowIdKey?: keyof T
  additionalActions?: React.ReactElement
  enablePagination?: {
    totalCount: number | undefined
    handleChangePagination: (pageNumber: number, pageSize: number) => void
  }
}

export const DataTable = <T extends { id?: string | number },>({ columns, rows, selection = false, minHeight = '67vh', isLoading, isRefetching, tableId, onRowSelection, enablePagination, highlightRowIds, rowIdKey = 'id', additionalActions }: DataGridProps<T>) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [localPageSize, setLocalPageSize] = React.useState(getPageSize())
  const [page, setPage] = React.useState<number>(getPageNumber())
  const location = usePathname()

  React.useEffect(() => {
    setPage(0)
    setPageNumber(0)
  }, [location])

  React.useEffect(() => {
    if (tableId) {
      const storageValue = localStorage.getItem(tableId)
        ? JSON.parse(String(localStorage.getItem(tableId)))
        : {}
      setColumnVisibility(storageValue)
    }
  }, [tableId])

  const handleColumnVisibilityChange = React.useCallback<OnChangeFn<VisibilityState>>(
    (updater) => {
      setColumnVisibility((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (old: VisibilityState) => VisibilityState)(prev)
            : updater

        if (tableId) {
          localStorage.setItem(tableId, JSON.stringify(next))
        }
        return next
      })
    },
    [tableId]
  )

  const changePage = (newPage: number) => {
    setPage(newPage)
    setPageNumber(newPage)
    if (enablePagination) {
      enablePagination.handleChangePagination(newPage, getPageSize())
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    changePage(1)
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select()
  }

  const tableColumns = React.useMemo<ColumnDef<T>[]>(() => {
    if (selection) {
      return [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="اختيار الكل"
              className="translate-y-[2px] m-2"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="اختيار الصف"
              className="translate-y-[2px] m-2"
            />
          ),
          enableSorting: false,
          enableHiding: false,
          size: 50
        },
        ...columns
      ]
    }

    return columns
  }, [columns, selection])

  React.useEffect(() => {
    const selectedRowIds = Object.keys(rowSelection)
    if (onRowSelection) {
      onRowSelection(selectedRowIds)
    }
  }, [rowSelection, onRowSelection])

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getRowId: (row) => String(row[rowIdKey]),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    manualPagination: !!enablePagination,
    pageCount: enablePagination ? Math.ceil((enablePagination.totalCount || 0) / getPageSize()) : undefined
  })

  function CustomLoading() {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: minHeight }}>
        <div className="flex items-center space-x-2">
          <Loader2 className="size-4 animate-spin" />
        </div>
      </div>
    )
  }

  function CustomToolbar() {
    return (
      <div className="flex items-center justify-between py-2 px-2 border-b mb-1">
        <div className="flex items-center gap-1">
          {/* Column visibility space-x-2 space-x-reverse ^ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8">
                <Columns3 className="size-4" />
                الأعمدة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {typeof column.columnDef.header === 'string'
                        ? column.columnDef.header
                        : column.id
                      }
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {additionalActions}

        </div>
      </div>
    )
  }

  const highlightedSet = React.useMemo(
    () => new Set((highlightRowIds ?? []).map(x => String(x).trim().toLowerCase())),
    [highlightRowIds]
  )

  if (isLoading) {
    return <CustomLoading />
  }
  // أضف هذا السطر قبل الـ return
  const pageDir = 'rtl'
  return (
    <div className="space-y-0">
      <CustomToolbar />
      <LinearLoading isLoading={isRefetching} />

      <div dir={pageDir} className="border rounded-none overflow-y-auto" style={{ minHeight, height: minHeight }}>
        <Table>
          <TableHeader className={'sticky top-0 z-10 bg-background'}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-right font-semibold border-b-0"
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isHighlighted = highlightedSet.has(String(row.id).trim().toLowerCase())

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={[
                      'h-10 hover:bg-muted/50',
                      row.getIsSelected() ? 'bg-muted/30' : '',
                      isHighlighted ? '!bg-green-100 hover:!bg-green-200' : ''
                    ].join(' ')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`border-b-0 ${cell.column.id === 'id' ? 'text-center' : 'text-right'} py-0`}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="!bg-white">
                <TableCell
                  colSpan={Math.max(1, table.getVisibleLeafColumns().length)}
                  className="h-50 text-center"
                >
                  لا يوجد نتائج
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && (
        <div className="flex items-center justify-between space-x-2 py-1 px-4 border-t-0" dir="rtl">
          <div dir="ltr">
            <CustomPagination
              currentPage={page}
              totalPages={Math.ceil((enablePagination.totalCount || 0) / getPageSize())}
              onPageChange={(newPage) => changePage(newPage)}
            />
          </div>

          {/*<div className="flex-1 text-center">*/}
          {/*  <FormLabel title={`العدد الكلي: ${enablePagination.totalCount}`}/>*/}
          {/*</div>*/}

          <div className="flex items-center space-x-2" dir="ltr">
            <Input
              type="number"
              value={localPageSize}
              onChange={(e) => {
                const newValue = Number(e.target.value)
                if (newValue > 0) {
                  if (newValue > 100) {
                    toast.error('لايجب ان يكون الرقم اكبر من 100')
                  } else {
                    setLocalPageSize(newValue)
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePageSizeChange(localPageSize)
                }
              }}
              onFocus={handleFocus}
              className="w-20 text-center h-8"
              min={1}
              max={100}
            />
          </div>
        </div>
      )}
    </div>
  )
}
