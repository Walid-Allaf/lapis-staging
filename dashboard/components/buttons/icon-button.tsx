import { Button } from "@/dashboard/components/shadcn-ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/dashboard/components/shadcn-ui/tooltip"
import { ReactNode } from "react"

interface ActionButtonProps {
  isLoading?: boolean
  handleClick: () => void
  permission?: boolean
  icon: ReactNode
  label: string
  type?: "button" | "submit" | "reset"
  variant?: 'outline' | 'link' | 'default' | 'destructive' | 'secondary' | 'ghost'
}

export function IconButton({
  isLoading,
  handleClick,
  permission = true,
  icon,
  label,
  type = "button",
  variant = "outline"
}: ActionButtonProps) {

  if (!permission) return null

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant={variant}
          disabled={isLoading}
          onClick={handleClick}
          type={type}
          className="w-[30px] p-[0.5rem]"
        >
          <span className={isLoading ? "animate-spin" : ""}>
            {icon}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}