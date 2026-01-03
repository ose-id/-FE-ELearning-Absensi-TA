'use client'

import { ReactNode, useState } from 'react'
import { TooltipProvider } from '@/contexts/tooltipProviders'
import { NextAuthProvider } from '@/contexts/nextAuthProviders'
import DashboardHeader from './DashboardHeader'
import DashboardSidebar from './DashboardSidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const handleClickOutside = () => {
    setSidebarExpanded(false)
  }

  return (
    <NextAuthProvider>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <DashboardSidebar 
            expanded={sidebarExpanded} 
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
            onClickOutside={handleClickOutside}
          />

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <DashboardHeader 
              onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} 
              sidebarExpanded={sidebarExpanded} 
            />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </NextAuthProvider>
  )
}
