import { Button } from '@/dashboard/components/shadcn-ui/button'
import { ConfirmDialog } from '@/dashboard/components'
import React from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function CloseDialog({ onClose, type, dirty, dialogTitle = 'هل أنت متأكد؟' }: CloseDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState<boolean>(false)

  const handleClick = () => {
    if (!dirty) {
      onClose()
    } else {
      setOpen(true)
    }
  }

  return (
    <>

      {type === 'icon' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className="h-9 w-9"
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {type === 'button' && (
        <Button
          variant="outline"
          onClick={handleClick}
          className="whitespace-nowrap"
          type="button"
        >
          {t("close")}
        </Button>
      )}

      <ConfirmDialog
        title={dialogTitle}
        dialogVariant="warning"
        close={() => setOpen(false)}
        onSubmit={onClose}
        open={open}
      />
    </>
  )
}

interface CloseDialogProps {
  onClose: () => void
  type: 'button' | 'icon'
  dirty: boolean
  dialogTitle?: string
}