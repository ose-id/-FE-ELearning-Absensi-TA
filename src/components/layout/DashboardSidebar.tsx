'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { NAV_ITEMS } from '@/config/navigation'
import { ROLES, type RoleCode } from '@/config/roles'
import { signOut } from 'next-auth/react'
import {
  Home,
  Users,
  Building2,
  Target,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'

import { cn } from '@/utils/commons'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'User Management', href: '/user-management' },
  { icon: Building2, label: 'Class Management', href: '/class-management' },
  { icon: Target, label: 'Subjects', href: '/subjects' },
  { icon: Briefcase, label: 'Assignments', href: '/assignment' },
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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

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
          'fixed left-0 top-0 z-30 h-screen shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col overflow-hidden',
          'bg-gradient-to-b from-[#1e5aa8] to-[#2563eb] lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-[20px]',
          expanded ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'
        )}
      >
        {/* Logo */}
        <div className="flex flex-col items-center px-6 pt-8 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white mb-3">
            <span className="text-2xl font-bold text-[#1e5aa8]">S</span>
          </div>
          <h2 className="text-base font-bold text-white">STOVIA</h2>
          <p className="text-xs text-white/90 text-center">Lorem Ipsum Dolor Sit Amet</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors text-white',
                      isActive
                        ? 'bg-black/40 font-medium'
                        : 'hover:bg-white/10'
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
      </aside >
    </>
  )
}