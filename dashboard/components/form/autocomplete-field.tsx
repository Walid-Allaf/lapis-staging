import React, { SyntheticEvent, useState, useRef, useCallback } from 'react'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
import { Field, getIn, type FieldProps } from 'formik'
import { useTranslation } from 'react-i18next'
import { cn } from '@/dashboard/lib/utils'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/dashboard/components/shadcn-ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/dashboard/components/shadcn-ui/popover'
import { Badge } from '@/dashboard/components/shadcn-ui/badge'
import { Skeleton } from '@/dashboard/components/shadcn-ui/skeleton'
import { FormLabel } from '../titles/form-label'

export const ErrorMessageStyled = ({ children, height }: { children: React.ReactNode; height: number }) => (
  <div
    className="text-destructive text-xs flex items-center rounded"
    style={{ height: `${height}px`, margin: '1rem 0' }}
  >
    {children}
  </div>
)

export function AutocompleteField({ name, label, options, loading = false, size = 'small', endWith, multiple = false, error = false, disableClearable = false, disabled = false, onChange: onChangeField, onInputChange, onScrollEnd, isFetching = false }: TProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const height = size === 'small' ? 38 : 55

  const filterOptions = (opts: AutocompleteOption[], searchValue: string) => {
    if (!searchValue) return opts?.slice(0, 5)
    return opts
      .filter((opt) => opt.name.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 5)
  }
  const filteredOptions = onInputChange ? options : filterOptions(options, search)

  // Handle input change with proper event
  const handleInputChange = useCallback((value: string) => {
    setSearch(value)
    if (onInputChange) {
      const syntheticEvent = {
        type: 'input',
        target: { value },
        currentTarget: { value }
      } as unknown as SyntheticEvent
      onInputChange(syntheticEvent, value, 'input')
    }
  }, [onInputChange])

  // Handle scroll to detect end
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!onScrollEnd) return

    const target = e.currentTarget
    const scrolledToBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50

    if (scrolledToBottom && !isFetching) {
      onScrollEnd()
    }
  }, [onScrollEnd, isFetching])

  return (
    <>
      {loading ? (
        <Skeleton className="w-full rounded" style={{ height: `${height}px` }} />
      ) : error ? (
        <ErrorMessageStyled height={height}>
          {t('sorry_something_went_wrong')}
        </ErrorMessageStyled>
      ) : (
        <Field validateOnBlur validateOnChange name={name}>
          {({ field, form: { touched, errors, ...form } }: FieldProps) => {
            const fieldValue = field.value

            const errorObj = getIn(errors, name)
            const isTouched = getIn(touched, name)

            const hasError = Boolean(errorObj && isTouched)
            const errorMessage =
              errorObj && isTouched
                ? String(errorObj?.id || errorObj?.name || errorObj).trim()
                : ''

            const handleSelect = (selectedOption: AutocompleteOption) => {
              if (multiple) {
                const currentValue = Array.isArray(fieldValue) ? fieldValue : []
                const isSelected = currentValue.some((item: AutocompleteOption) => item.id === selectedOption.id)

                const newValue = isSelected
                  ? currentValue.filter((item: AutocompleteOption) => item.id !== selectedOption.id)
                  : [...currentValue, selectedOption]

                form.setFieldValue(name, newValue)
                if (onChangeField) onChangeField(newValue)
              } else {
                form.setFieldValue(name, selectedOption)
                if (onChangeField) onChangeField(selectedOption)
                setOpen(false)
              }
            }

            const handleClear = (e: React.MouseEvent) => {
              e.stopPropagation()
              if (!disableClearable) {
                if (multiple) {
                  form.setFieldValue(name, [])
                  if (onChangeField) onChangeField([])
                } else {
                  form.setFieldValue(name, { id: null, name: '' })
                  if (onChangeField) onChangeField(null)
                }
              }
            }

            const removeTag = (e: React.MouseEvent, itemToRemove: AutocompleteOption) => {
              e.stopPropagation()
              const newValue = fieldValue.filter((item: AutocompleteOption) => item.id !== itemToRemove.id)
              form.setFieldValue(name, newValue)
              if (onChangeField) onChangeField(newValue)
            }

            const isSelected = (option: AutocompleteOption) => {
              if (multiple) {
                return Array.isArray(fieldValue) && fieldValue.some((item: AutocompleteOption) => item.id === option.id)
              }
              return fieldValue?.id === option.id
            }

            const getDisplayValue = () => {
              if (multiple) {
                return Array.isArray(fieldValue) && fieldValue.length > 0
                  ? `${fieldValue.length} selected`
                  : ''
              }
              return fieldValue?.name || ''
            }

            const hasValue = multiple
              ? Array.isArray(fieldValue) && fieldValue.length > 0
              : fieldValue?.id

            return (
              <div className="w-full">
                <FormLabel title={label} />
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={disabled}
                      className={cn(
                        'w-full justify-between font-normal',
                        multiple ? 'h-auto min-h-[38px] py-2' : size === 'small' ? 'h-[38px]' : 'h-[55px]',
                        hasError && 'border-destructive',
                        !multiple && fieldValue?.color && 'border-opacity-30',
                        disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      style={
                        !multiple && fieldValue?.color
                          ? {
                            // borderColor: `rgba(${fieldValue.color}, 0.3)`,
                            // maxWidth: 'max-content',
                            minWidth: `${fieldValue.name.length * 6.5 + 10}px`
                          }
                          : {}
                      }
                    >
                      <div
                        tabIndex={disabled ? -1 : 0}
                        aria-disabled={disabled}
                        onClick={event => { if (disabled) event.preventDefault() }}
                        onKeyDown={event => {
                          if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                            event.preventDefault()
                            if (!disabled) setOpen(value => !value)
                          }
                        }}
                      >
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {multiple && Array.isArray(fieldValue) && fieldValue.length > 0 ? (
                          <div className="flex gap-1 flex-wrap flex-1">
                            {fieldValue.map((item: AutocompleteOption, index: number) => (
                              <Badge
                                key={index}
                                style={{ backgroundColor: item.color ?? undefined }}
                                className="text-white flex-shrink-0"
                              >
                                {item.name}
                                <button
                                  type="button"
                                  className="ml-1 hover:bg-white/20 rounded-full"
                                  onClick={(e) => removeTag(e, item)}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : !multiple && fieldValue?.color ? (
                          <Badge
                            style={{ backgroundColor: fieldValue.color }}
                            className="text-white text-xs"
                          >
                            {fieldValue.name}
                          </Badge>
                        ) : (
                          <span className={cn(!hasValue && 'text-muted-foreground')}>
                            {getDisplayValue() || 'البحث...'}
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex items-center gap-1 flex-shrink-0 self-start',
                          // multiple ? '' : 'mt-[-3px]'
                        )}
                      >
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
                        {hasValue && !disableClearable && !disabled && (
                          <button
                            type="button"
                            onClick={handleClear}
                            className="hover:bg-accent rounded-sm p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        {endWith}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </div>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[9999]" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="البحث..."
                        value={search}
                        onValueChange={handleInputChange}
                      />
                      {isFetching ? null : <CommandEmpty>لايوجد بيانات</CommandEmpty>}

                      <CommandList
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="max-h-64 overflow-y-auto"
                      >
                        <CommandGroup className="overflow-visible">
                          {filteredOptions.map((option: AutocompleteOption) => (
                            <CommandItem
                              key={String(option.id)}
                              value={String(option.id)}
                              onSelect={() => handleSelect(option)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  isSelected(option) ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {option.color || option.color === null ? (
                                <Badge
                                  style={{ backgroundColor: option.color ?? undefined }}
                                  className="text-white"
                                >
                                  {option.name}
                                </Badge>
                              ) : (
                                option.name
                              )}
                            </CommandItem>
                          ))}
                          {isFetching && (
                            <div className="flex justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errorMessage && (
                  <p className="text-xs text-destructive mt-1">{t(errorMessage)}</p>
                )}
              </div>
            )
          }}
        </Field>
      )}
    </>
  )
}

export type TProps = {
  name: string
  label: string
  options: AutocompleteOption[]
  loading?: boolean
  size?: 'medium' | 'small'
  multiple?: boolean
  error?: boolean
  disableClearable?: boolean
  readOnly?: boolean
  disabled?: boolean
  onChange?: (val: unknown) => void
  onInputChange?: ((event: SyntheticEvent<Element, Event>, value: string, reason: string) => void) | undefined
  onScrollEnd?: () => void
  isFetching?: boolean
  endWith?: React.ReactNode
}

export type AutocompleteOption = { id: unknown; name: string; color?: string | null }
