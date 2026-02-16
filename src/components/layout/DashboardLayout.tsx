'use client'

import { ReactNode, useState, useEffect } from 'react'
import { TooltipProvider } from '@/contexts/tooltipProviders'
import { NextAuthProvider } from '@/contexts/nextAuthProviders'
import DashboardHeader from './DashboardHeader'
import DashboardSidebar from './DashboardSidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  // Initialize sidebar state based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarExpanded(true)
      } else {
        setSidebarExpanded(false)
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
            <main
              className="flex-1 overflow-y-auto p-6"
              onClick={() => {
                if (sidebarExpanded) setSidebarExpanded(false)
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </NextAuthProvider>
  )
}
