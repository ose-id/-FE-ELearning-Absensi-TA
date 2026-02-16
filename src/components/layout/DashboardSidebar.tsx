'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { cn } from '@/utils/commons'
import { NAV_ITEMS } from '@/config/navigation'
import { ROLES, type RoleCode } from '@/config/roles'

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
  onClickOutside?: () => void
}

export default function DashboardSidebar({ expanded, onToggle, onClickOutside }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Default to Student if no role found (or handle as loading/empty)
  const userRole = (session?.user?.roleCode as RoleCode) || ROLES.STUDENT

  // Get nav items for current role, fallback to student or empty array
  const currentNavItems = NAV_ITEMS[userRole] || NAV_ITEMS[ROLES.STUDENT]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        onClickOutside?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClickOutside])

  return (
    <>
      {/* Mobile Overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClickOutside}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-30 h-full bg-white shadow-lg transition-transform duration-300 lg:static lg:translate-x-0',
          expanded ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">S.T.O.V.I.A</h2>
            <p className="text-xs text-gray-500">Learning System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-blue-50 font-medium text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
