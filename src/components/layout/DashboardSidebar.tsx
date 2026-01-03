'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  Home,
  Users,
  Building2,
  Target,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react'

import { cn } from '@/utils/commons'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'User Management', href: '/user-management' },
  { icon: Building2, label: 'Class Management', href: '/class-management' },
  { icon: Target, label: 'Subjects', href: '/subjects' },
  { icon: Briefcase, label: 'Assignment', href: '/assignment' },
  { icon: Calendar, label: 'Attendance', href: '/attendance' },
  { icon: BarChart3, label: 'Reporting', href: '/reporting' },
  { icon: Settings, label: 'Master', href: '/master' },
]

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
  onClickOutside?: () => void
}

export default function DashboardSidebar({ expanded, onToggle, onClickOutside }: SidebarProps) {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)

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
            {navItems.map((item) => {
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
