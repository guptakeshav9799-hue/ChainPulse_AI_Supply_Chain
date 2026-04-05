import { ChartBar as BarChartIcon, Box as BoxIcon, PhoneIncoming as HomeIcon, LayoutDashboard as LayoutDashboardIcon, Settings as SettingsIcon, TriangleAlert as TriangleAlertIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activePage: string
  onNavigate: (page: string) => void
}

export function AppSidebar({ activePage, onNavigate, ...props }: AppSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    { id: 'shipments', label: 'Shipments', icon: BoxIcon },
    { id: 'disruptions', label: 'Disruptions', icon: TriangleAlertIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChartIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HomeIcon className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ChainPulse AI</span>
            <span className="text-xs text-muted-foreground">Supply Chain</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activePage === item.id}
                    onClick={() => onNavigate(item.id)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
