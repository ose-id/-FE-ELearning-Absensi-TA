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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { cn } from '@/utils/commons'


interface SidebarProps {
  expanded: boolean
  onToggle: () => void
  onClickOutside?: () => void
}

export default function DashboardSidebar({ expanded, onToggle, onClickOutside }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Normalize role code to handle potential backend variations
  const getNormalizedRole = (role?: string): RoleCode => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
      case 'ADM':
        return ROLES.ADMIN
      case 'TEACHER':
      case 'GURU':
      case 'TCR':
      case 'GR':          // ← backend code for Guru
        return ROLES.TEACHER
      case 'STUDENT':
      case 'MURID':
      case 'STD':
      case 'MR':          // ← backend code for Murid
        return ROLES.STUDENT
      default:
        return ROLES.STUDENT
    }
  }

  const userRole = getNormalizedRole(session?.user?.vrole_code)

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
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-30 h-screen shadow-lg lg:static flex flex-col overflow-hidden',
          'bg-gradient-to-b from-[#1e5aa8] to-[#2563eb] lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-[20px]',
          expanded ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        )}
      >
        {/* Logo */}
        <div className={cn("flex flex-col items-center", expanded ? "px-6 pt-8 pb-6" : "px-2 pt-6 pb-4")}>
          <div className={cn("flex items-center justify-center rounded-2xl bg-white", expanded ? "h-16 w-16 mb-3" : "h-10 w-10 mb-0")}>
            <span className={cn("font-bold text-[#1e5aa8]", expanded ? "text-2xl" : "text-xl")}>S</span>
          </div>
          <div className={cn("text-center overflow-hidden", expanded ? "opacity-100 max-h-20" : "opacity-0 max-h-0 lg:hidden")}>
            <h2 className="text-base font-bold text-white">STOVIA</h2>
            <p className="text-xs text-white/90">Lorem Ipsum Dolor Sit Amet</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {currentNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={!expanded ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg py-3 text-sm transition-colors text-white',
                      isActive
                        ? 'bg-black/40 font-medium'
                        : 'hover:bg-white/10',
                      expanded ? 'px-4' : 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className={cn("whitespace-nowrap overflow-hidden", expanded ? "opacity-100 w-auto" : "opacity-0 w-0 lg:hidden")}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-3 pb-2">
          <button
            onClick={handleLogout}
            title={!expanded ? "Log Out" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg py-3 text-sm font-medium text-red-300 transition-colors hover:bg-white/10 hover:text-red-200 w-full",
              expanded ? "px-4" : "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={cn("whitespace-nowrap overflow-hidden", expanded ? "opacity-100 w-auto" : "opacity-0 w-0 lg:hidden")}>
              Log Out
            </span>
          </button>
        </div>

        {/* Collapse Toggle Button */}
        <div className={cn("p-4 border-t border-white/10", expanded ? "" : "flex justify-center")}>
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center gap-3 rounded-lg py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white w-full",
              expanded ? "px-4" : "justify-center px-2"
            )}
          >
            {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            <span className={cn("overflow-hidden whitespace-nowrap", expanded ? "w-auto opacity-100" : "w-0 opacity-0 lg:hidden")}>
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}