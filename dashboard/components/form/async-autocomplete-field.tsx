import { useState } from 'react'
import { useDebounce, useAutocomplete } from '@/dashboard/hooks'
import { AutocompleteField } from '@/dashboard/components'

type AutocompleteOption = {
  id: unknown
  name: string
}

interface AsyncAutoCompleteFieldProps {
  name: string
  label: string
  fetchParams: {
    endpoint: string
    queryKey: string
    itemsKey: string
    searchParam?: string
  }
  additionalParams?: Record<string, unknown>
  formatOptions: (item: unknown) => AutocompleteOption
  onChange?: (val: unknown) => void
  size?: 'small' | 'medium'
  disabled?: boolean
  multiple?: boolean
}

export const AsyncAutocompleteField = (props: AsyncAutoCompleteFieldProps) => {
  const {
    name,
    label,
    fetchParams,
    additionalParams,
    formatOptions,
    onChange,
    size = 'small',
    disabled = false,
    multiple = false
  } = props

  const [query, setQuery] = useState('')
  const debouncedValue = useDebounce(query, 200)

  const {isError, data, isFetching} =
    useAutocomplete<Record<string, unknown[]> | unknown[]>({
      endpoint: fetchParams.endpoint,
      queryKey: fetchParams.queryKey,
      search: debouncedValue,
      searchParam: fetchParams.searchParam,
      additionalParams
    })

  const items = Array.isArray(data) ? data : data?.[fetchParams.itemsKey] ?? []
  const options = items.map((item) => formatOptions(item))

  return (
    <AutocompleteField
      name={name}
      label={label}
      disabled={disabled}
      options={options}
      size={size}
      error={isError}
      onInputChange={(_, newVal) => setQuery(newVal)}
      isFetching={isFetching}
      onChange={onChange}
      multiple={multiple}
    />
  )
}
