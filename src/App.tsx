import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { DashboardPage } from '@/pages/dashboard'
import { ShipmentsPage } from '@/pages/shipments'
import { DisruptionsPage } from '@/pages/disruptions'
import { AnalyticsPage } from '@/pages/analytics'
import { SettingsPage } from '@/pages/settings'
import { Toaster } from '@/components/ui/sonner'

export function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />
      case 'shipments':
        return <ShipmentsPage />
      case 'disruptions':
        return <DisruptionsPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

export default App
