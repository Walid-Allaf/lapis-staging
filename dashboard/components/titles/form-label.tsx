import { Label } from '@/dashboard/components/shadcn-ui/label'
import { cn } from '@/dashboard/lib/utils'

export function FormLabel({ title, className, error }: FormTitleProps) {
  return (
    <Label
      className={cn(
        'block mt-1 mb-0.5 text-sm whitespace-nowrap',
        error && 'text-destructive',
        className
      )}
    >
      {title}
    </Label>
  )
}

type FormTitleProps = {
  title: string
  className?: string
  error?: boolean
}
