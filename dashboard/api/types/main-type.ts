export interface MainType {
    data: object | null | string | number
    isSuccess?: boolean
    error?: string | null
    paging: Pagination
}

export interface Pagination {
    pageNumber: number
    pageSize: number
    totalRecords: number
}
