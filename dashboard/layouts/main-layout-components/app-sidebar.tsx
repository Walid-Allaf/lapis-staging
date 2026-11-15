'use client'

import React from 'react'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/dashboard/components/shadcn-ui/sidebar'
import { NavMain, type NavGroup } from './nav-main'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { logoWhiteBg } from '@/dashboard/assets'

export function AppSidebar({sidebarItems, ...props}: React.ComponentProps<typeof Sidebar> & { sidebarItems: NavGroup[] }) {
  const {t, i18n} = useTranslation()
  const language = i18n.language

  return (
    <Sidebar {...props} side={language == 'ar' ? 'right' : 'left'} variant={'sidebar'}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-2">
              <Link href={'/dashboard'}>
                <img src={logoWhiteBg} alt="logoWhiteBg" className={'h-[30px]'}/>
                <span>{t('project_name')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems}/>
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {/*<NavUser user={rootUser} />*/}
      </SidebarFooter>
    </Sidebar>
  )
}
