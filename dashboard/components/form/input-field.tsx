import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Eye, EyeOff, X } from 'lucide-react'
import { ErrorMessage, Field, getIn, type FieldProps } from 'formik'
import { useState } from 'react'
import { FormLabel } from '@/dashboard/components'
import { Input } from '@/dashboard/components/shadcn-ui/input'
import { Textarea } from '@/dashboard/components/shadcn-ui/textarea'
import { cn } from '@/dashboard/lib/utils'
import { useTranslation } from 'react-i18next'

export function InputField(inputFieldProps: TProps) {
  const {
    name,
    type = 'string',
    startWith,
    label,
    align,
    component = 'input',
    size = 'small',
    endWith,
    margin = 'none',
    onClearable,
    disabled = false,
    onChange: onChangField,
    placeholder,
    error,
    clearable,
    min,
    max,
    onKeyDown,
    inputMode,
    dir = 'rtl',
    props,
    className,
    loading = false
  } = inputFieldProps
  const {t} = useTranslation()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type !== 'password') event.target.select()
  }

  const marginClasses = {
    normal: 'my-4',
    dense: 'my-2',
    none: ''
  }
  return (
    <Field validateOnBlur validateOnChange name={name}>
      {({ field: { onChange, ...field }, form: { touched, errors, ...form } }: FieldProps) => {
        const fieldError =
          getIn(errors, name)

        const fieldTouched =
          getIn(touched, name)

        const hasError =
          Boolean((fieldError && fieldTouched) || error)
        return (
          <div className="flex-1">
            <FormLabel title={label} className={`text-sm font-medium text-${align}`} error={hasError} />
            <div className={cn('relative', marginClasses[margin])}>
              {loading ? (
                // Skeleton loading state
                component === 'textarea' ? (
                  <div className={cn(
                    'w-full rounded-md bg-gray-200 animate-pulse',
                    'h-[72px]', // Approximate height for 3 rows
                    className
                  )} />
                ) : (
                  <div className={cn(
                    'w-full rounded-md bg-gray-200 animate-pulse',
                    size === 'small' ? 'h-8' : 'h-10',
                    className
                  )} />
                )
              ) : (
                <>
                  {startWith && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 ${(typeof startWith == 'string' && startWith.length > 2) ? 'text-xs' : 'text-md'}`}>
                      {startWith}
                    </div>
                  )}

                  {component === 'textarea' ? (
                    <Textarea
                      dir={dir}
                      {...field}
                      {...props}
                      onKeyDown={onKeyDown}
                      onFocus={handleFocus}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        onChange(e)
                        onChangField?.(e)
                      }}
                      placeholder={placeholder}
                      disabled={disabled}
                      rows={3}
                      className={cn(
                        'resize-none',
                        hasError && 'border-red-500',
                        startWith && 'pl-10',
                        dir === 'rtl' && 'text-right',
                        className
                      )}
                    />
                  ) : (
                    <Input
                      dir={dir}
                      {...field}
                      {...props}

                      type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                      onKeyDown={onKeyDown}
                      onWheel={(event) => event.currentTarget.blur()}
                      onFocus={handleFocus}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        onChange(e)
                        onChangField?.(e)
                      }}
                      placeholder={placeholder}
                      disabled={disabled}
                      min={min}
                      max={max}
                      inputMode={inputMode}
                      className={cn(
                        size === 'small' ? 'h-9 text-sm' : 'h-10',
                        hasError && 'border-red-500',
                        startWith && 'pl-10',
                        (type === 'password' || clearable || endWith) && 'pr-10',
                        dir === 'rtl' && 'text-right',
                        className
                      )}
                    />
                  )}

                  {/* End adornments */}
                  {component !== 'textarea' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {type === 'password' ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      ) : (
                        <>
                          {clearable &&
                            field.value !== null &&
                            field.value !== undefined &&
                            field.value !== '' &&
                            field.value !== 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  form.setFieldValue(name, '')
                                  onClearable?.()
                                }}
                                aria-label="clear input"
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          {endWith}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {!loading && (
              <ErrorMessage name={name}>
                {(msg) => <div className="text-red-500 text-xs mt-1">{t(msg)}</div>}
              </ErrorMessage>
            )}
          </div>
        )
      }}
    </Field>
  )
}

export type TProps = {
  name: string
  type?: string
  label: string
  align?: string
  component?: 'textarea' | 'input' | undefined
  size?: 'medium' | 'small'
  startWith?: React.ReactNode
  endWith?: React.ReactNode
  margin?: 'normal' | 'none' | 'dense'
  onClearable?: () => void
  disabled?: boolean
  props?: React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>
  onChange?: (val: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  error?: boolean
  clearable?: boolean
  min?: string | number
  max?: string | number
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  dir?: 'ltr' | 'rtl'
  className?: string
  loading?: boolean
}
