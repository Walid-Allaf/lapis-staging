import * as React from 'react'
import { useField } from 'formik'
import { Switch } from '@/dashboard/components/shadcn-ui/switch'
import { Label } from '@/dashboard/components/shadcn-ui/label'
import { cn } from '@/dashboard/lib/utils'

type SwitchInputProps = {
  name: string
  label: React.ReactNode
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  labelClassName?: string
  switchClassName?: string
}

export function SwitchField({name, label, onChange, disabled = false, className, labelClassName, switchClassName}: SwitchInputProps) {
  const [field, meta, helpers] = useField<boolean>(name)
  const hasError = Boolean(meta.touched && meta.error)

  const id = React.useId()

  const handleCheckedChange = (checked: boolean) => {
    helpers.setValue(checked)
    onChange?.(checked)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
    >
      <Switch
        id={id}
        dir={'ltr'}
        checked={Boolean(field.value)}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={cn(
          hasError && 'data-[state=unchecked]:border-destructive',
          switchClassName
        )}
      />
      <Label
        htmlFor={id}
        className={cn(
          'text-sm font-medium',
          hasError && 'text-destructive',
          labelClassName
        )}
      >
        {label}
      </Label>

    </div>
  )
}
