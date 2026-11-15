'use client'

import * as React from 'react'

import { House, Search, Grid2x2, Settings } from 'lucide-react'

import { Button } from '@/dashboard/components/shadcn-ui/button'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/dashboard/components/shadcn-ui/command'
import { useRouter } from 'next/navigation'

const searchItems = [
  // Home
  {group: 'القائمة', icon: House, label: 'الرئيسية', url: '/dashboard'},
  // Settings
  {group: 'الإعدادات', icon: Settings, label: 'الإعدادات', url: '/dashboard/settings'},
]

export function SearchDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div className={'hidden lg:flex'}>
      <Button
        variant="link"
        className="text-muted-foreground font-normal hover:no-underline border px-0.5"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4"/>
        بحث في الصفحات
        <kbd className="bg-muted inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium select-none">
          <span className="text-xs">J</span>
          <span className="text-xs">+</span>
          <span className="text-xs">
            <Grid2x2/>
          </span>
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false} className="z-[9999]">
        <CommandInput placeholder="البحث في الصفحات..."/>
        <CommandList>
          <CommandEmpty>لايوجد بيانات</CommandEmpty>
          {[...new Set(searchItems.map((item) => item.group))]
            .map((group, i) => (
              <React.Fragment key={group}>
                {i !== 0 && <CommandSeparator/>}
                <CommandGroup heading={group} key={group}>
                  {searchItems
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <CommandItem
                        className="!py-1.5"
                        key={item.label}
                        onSelect={() => {
                          setOpen(false)
                          router.push(item.url || '')
                        }}
                      >
                        {item.icon && <item.icon/>}
                        <span>{item.label}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </React.Fragment>
            ))}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
