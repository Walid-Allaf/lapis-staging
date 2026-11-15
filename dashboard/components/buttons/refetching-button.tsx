import { PermissionEnum } from '@/dashboard/api/types/enums'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/dashboard/components/shadcn-ui/tooltip'
import { RefreshCw } from 'lucide-react'

export function RefetchingButton({isRefetching, handleRefetch, permission}: RefetchingButtonProps) {

  const isAllowed = permission ? permission : true

  return (
    isAllowed ? (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" color="primary" disabled={isRefetching} onClick={handleRefetch} className="w-[30px] p-[0.5rem]">
              <RefreshCw className={isRefetching ? 'spin' : ''}/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تحديث البيانات</p>
          </TooltipContent>
        </Tooltip>
      ) :
      <></>
  )
}

interface RefetchingButtonProps {
  isRefetching: boolean
  handleRefetch: () => void
  permission?: PermissionEnum
}
