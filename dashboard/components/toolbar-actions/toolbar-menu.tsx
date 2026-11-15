'use client'
import React from 'react'
import { ChevronsUpDown, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, useConfirmStore } from '@/dashboard/stores'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/dashboard/components/shadcn-ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/dashboard/components/shadcn-ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/dashboard/components/shadcn-ui/avatar'
import { useLogout } from '@/dashboard/features/login/hooks'

export const ToolbarMenu: React.FC = () => {
  const username = useAuthStore((s) => s.user?.email)
  const { handleLogout } = useLogout()
  const setConfirm = useConfirmStore((s) => s.setConfirm)
  const firstLetter =
    (username ?? '').trim().slice(0, 1).toLocaleUpperCase() || 'U'

  const onLogout = async () => {
    handleLogout()
    toast.success('تمت عملية تسجيل الخروج بنجاح')
  }

  return (
    <TooltipProvider>
      <DropdownMenu dir={'rtl'}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 pl-1 pr-2 gap-2 data-[state=open]:bg-accent"
              >
                <Avatar className="size-8">
                  {/* keep AvatarImage if you later add a user image url */}
                  <AvatarImage src={undefined} alt={username ?? 'user'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {firstLetter}
                  </AvatarFallback>
                </Avatar>

                <span className="hidden lg:inline-block text-sm lowercase px-1">
                  {username}
                </span>

                <ChevronsUpDown className="ml-auto size-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="top" className={'relative z-[9999]'}>إعدادات الحساب</TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          align="start"
          className="w-(--radix-dropdown-menu-trigger-width) min-w-44 relative z-[9999]"
        >
          <DropdownMenuItem
            className="cursor-pointer justify-end"
            // prevent the default close to show confirmation immediately after click feels snappier
            onSelect={(e) => {
              e.preventDefault()
              setConfirm({
                type: 'warning',
                message: 'هل تريد تسجيل الخروج؟',
                isOpen: true,
                onConfirm: () => onLogout()
              })
            }}
          >
            <span>تسجيل الخروج</span>
            <LogOut className="size-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
