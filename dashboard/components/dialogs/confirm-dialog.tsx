import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/dashboard/components/shadcn-ui/dialog'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { cn } from '@/dashboard/lib/utils'
import { CircleCheck, CircleCheckBig, Info, TriangleAlert } from 'lucide-react'

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { title, subTitle, dialogVariant, onSubmit, close, open, content, onCancel } = props
  const dialogIcon = icon(dialogVariant)

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showCloseButton={false} aria-describedby={undefined} className={'z-[101] w-[400px] '}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Icon container (was Box) */}
        <div
          className={
            'h-[100px] max-w-[483px] grid place-items-center rounded-[11px] pt-2 [&_svg]:h-full! [&_svg]:w-full!'
          }
        >
          {dialogIcon}
        </div>

        {/* Text container (was Box + Typography) */}
        <div className={'text-center'}>
          <h3
            className={cn(
              'mx-auto min-w-[250px] font-bold text-[18px] sm:text-[20px]',
              dialogVariant === 'warning'
                ? 'text-warning'
                : dialogVariant === 'error'
                  ? 'text-destructive'
                  : dialogVariant === 'success'
                    ? 'text-green-600'
                    : 'text-primary'
            )}
          >
            {title}
          </h3>

          {subTitle ? (
            <p className={'mx-auto mt-1 max-w-[483px] px-1 text-[14px] text-muted-foreground'}>
              {subTitle}
            </p>
          ) : null}

          {content ? (
            <p className={'mx-auto mt-1 max-w-[483px] px-1 text-[14px] text-muted-foreground'}>
              {content}
            </p>
          ) : null}
        </div>

        <DialogFooter className={'flex flex-nowrap items-center gap-2'}>


          <Button
            variant={'outline'}
            className={'w-full sm:flex-1'}
            onClick={() => {
              onCancel?.()
              close()
            }}
          >
            لا
          </Button>
          <Button
            variant={'default'}
            className={cn(
              'w-full sm:flex-1',
              dialogVariant === 'warning'
                ? 'bg-warning hover:bg-warning/90'
                : dialogVariant === 'error'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : dialogVariant === 'success'
                    ? 'bg-green-500 hover:bg-green-500/90'
                    : 'bg-primary hover:bg-primary/90'
            )}
            onClick={() => {
              onSubmit?.()
              close()
            }}
          >
            نعم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDialogProps {
  title: string
  subTitle?: string
  dialogVariant: "error" | "success" | "warning" | "info" | "validity" | "edit"
  onSubmit?: () => void
  close: () => void
  open: boolean
  content?: React.ReactNode
  onCancel?: () => void
}

const icon = (variant: string): React.JSX.Element => {
  if (variant === 'success') return <CircleCheckBig className={'size-40 text-success'} />
  if (variant === 'error') return <CircleCheck className={'size-40 text-destructive'} />
  if (variant === 'warning') return <TriangleAlert className={'size-40 text-warning'} />
  return <Info className={'size-40 text-warning'} />
}
