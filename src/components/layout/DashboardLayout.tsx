'use client'

import { ReactNode, useState, useEffect } from 'react'
import { TooltipProvider } from '@/contexts/tooltipProviders'
import { NextAuthProvider } from '@/contexts/nextAuthProviders'
import DashboardHeader from './DashboardHeader'
import DashboardSidebar from './DashboardSidebar'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ROLES, type RoleCode, getNormalizedRole } from '@/config/roles'
import AccessDenied from '@/components/ui/AccessDenied'

interface DashboardLayoutProps {
  children: ReactNode
  hideHeader?: boolean
  hideSidebar?: boolean
  allowedRoles?: RoleCode[]
}

export default function DashboardLayout({
  children,
  hideHeader = false,
  hideSidebar = false,
  allowedRoles
}: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  const userRole = session?.user?.vrole_code ? getNormalizedRole(session.user.vrole_code) : null
  const isRoleAllowed = !allowedRoles || (userRole && allowedRoles.includes(userRole))

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

  // Forced password change logic
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.mustChangePassword) {
      if (pathname !== '/change-password') {
        router.push('/change-password')
      }
    }
  }, [session, status, pathname, router])

  const handleClickOutside = () => {
    setSidebarExpanded(false)
  }

  return (
    <NextAuthProvider>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          {!hideSidebar && (
            <DashboardSidebar
              expanded={sidebarExpanded}
              onToggle={() => setSidebarExpanded(!sidebarExpanded)}
              onClickOutside={handleClickOutside}
            />
          )}

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            {!hideHeader && (
              <DashboardHeader
                onMenuClick={() => setSidebarExpanded(!sidebarExpanded)}
                sidebarExpanded={sidebarExpanded}
              />
            )}

            {/* Page Content */}
            <main
              className="flex-1 overflow-y-auto p-6"
              onClick={() => {
                if (sidebarExpanded) setSidebarExpanded(false)
              }}
            >
              {status === 'loading' ? (
                <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
              ) : status === 'authenticated' && !isRoleAllowed ? (
                <AccessDenied />
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </NextAuthProvider>
  )
}
