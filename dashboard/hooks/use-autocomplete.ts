import { useQuery } from '@tanstack/react-query'
import axios from '@/dashboard/api/axios'

export const useAutocomplete = <TData>(props: AutocompleteParams) => {
  const {
    search,
    endpoint,
    queryKey,
    searchParam = 'filter[name]',
    additionalParams = {}
  } = props

  return useQuery<TData>({
    queryKey: [queryKey, search, searchParam, additionalParams],
    queryFn: async () => {
      const res = await axios.get(endpoint, {
        params: {
          [searchParam]: search,
          perPage: '3',
          page: '1',
          ...additionalParams
        }
      })

      return res.data.data as TData
    }
  })
}

interface AutocompleteParams {
  search: string
  endpoint: string
  queryKey: string
  searchParam?: string
  additionalParams?: Record<string, unknown>
}
