import { ConfirmDialog, ToggleFullScreen, ToolbarMenu } from '@/dashboard/components'
import { useConfirmStore} from '@/dashboard/stores'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/dashboard/components/shadcn-ui/sidebar'
import { cn } from '@/dashboard/lib/utils'
import { Separator } from '@/dashboard/components/shadcn-ui/separator'
import { SearchDialog } from './search-dialog'
import { AppSidebar } from '@/dashboard/layouts/main-layout-components/app-sidebar'
import { NavGroup, NavMainItem } from '@/dashboard/layouts/main-layout-components/nav-main'

export default function MainLayout({NAVIGATION, children}: ToolpadProps) {
  const {confirm, close} = useConfirmStore()

  // visible?: boolean  → default to true
  const isVisible = (v?: boolean) => v !== false

  const filterNav = (groups: NavGroup[]): NavGroup[] => {
    return groups
      .map<NavGroup>((group) => {
        const filteredItems: NavMainItem[] = group.items
          .filter((item) => isVisible(item.visible))
          .map((item) => {
            const filteredSub =
              item.subItems?.filter((s) => isVisible(s.visible)) ?? undefined

            // Keep the parent (it has a real url) even if filteredSub is empty.
            // If you prefer to hide parents with no visible subItems, change the
            // final .filter below to check length.
            return {
              ...item,
              subItems: filteredSub && filteredSub.length > 0 ? filteredSub : undefined
            }
          })

        return {...group, items: filteredItems}
      })
      // drop groups that ended up empty
      .filter((g) => g.items.length > 0)
  }

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant={'sidebar'} sidebarItems={filterNav(NAVIGATION)}/>
        <SidebarInset
          data-content-layout={'full-width'}
          className={cn(
            'data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl !w-[calc(100%_-_var(--sidebar-width))]',
            // Adds right margin for inset sidebar in centered layout up to 113rem.
            // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
            'max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto'
          )}
        >
          <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1"/>
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4"/>
                <SearchDialog/>
              </div>
              <div className="flex items-center gap-2">
                
                <ToggleFullScreen/>
                <ToolbarMenu/>
                {/*<LayoutControls {...layoutPreferences} />*/}
                {/*<ThemeSwitcher />*/}
                {/*<AccountSwitcher users={users} />*/}
              </div>
            </div>
          </header>
          <div
            className="h-full p-2 md:p-4"
            style={{
              width: '',
            }}
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Main ConfirmDialog 👇🏻 */}
      <ConfirmDialog
        title={confirm.message}
        dialogVariant={confirm.type}
        close={close}
        onSubmit={confirm.onConfirm}
        open={confirm.isOpen}
        subTitle={confirm.subTitle}
        content={confirm.content}
        onCancel={confirm.onCancel}
      />
    </>
  )
}

interface ToolpadProps {
  NAVIGATION: NavGroup[]
  children: React.ReactNode
}
