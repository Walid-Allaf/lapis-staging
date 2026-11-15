import React from 'react'
import { PermissionEnum } from '@/dashboard/api/types/enums'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/dashboard/components/shadcn-ui/tooltip'
import { Plus } from 'lucide-react'

export function AddButton({ text, onClick, permission, icon, type = 'button' }: AddButtonProps) {
  // const hasPermission = useAuthStore((s) => s.hasPermission)

  const isAllowed = permission ? permission : true

  return (
    isAllowed ? (
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            color="primary"
            size="sm"
            onClick={onClick}
            type={type}
            className="text-sm font-semibold flex items-center gap-0.5 w-[30px] md:w-fit md:p-[0.5rem]"
          >
            <p className={'hidden md:flex'}>{text}</p>
            {icon ? icon : <Plus />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    ) :
      <></>
  )
}

interface AddButtonProps {
  text: string
  onClick: () => void
  permission?: PermissionEnum
  icon?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
}
