import React from 'react'
import { closeFullscreenMode, openFullscreenMode } from '@/dashboard/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/dashboard/components/shadcn-ui/tooltip'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Maximize, Minimize } from 'lucide-react'

export const ToggleFullScreen: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const handleToggle = () => {
    if (isFullscreen) {
      closeFullscreenMode()
      setIsFullscreen(false)
    } else {
      openFullscreenMode()
      setIsFullscreen(true)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            aria-label="تبديل ملء الشاشة"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4 text-muted-foreground"/>
            ) : (
              <Maximize className="h-4 w-4 text-muted-foreground"/>
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>تبديل ملء الشاشة</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
