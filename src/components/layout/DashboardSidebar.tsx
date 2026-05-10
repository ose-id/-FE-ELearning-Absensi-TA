'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { NAV_ITEMS } from '@/config/navigation'
import { ROLES, type RoleCode } from '@/config/roles'
import {
  Home,
  Users,
  Building2,
  Target,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronDown,
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

  // State for expanded submenus
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

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

  // Check if a menu item has active child
  const hasActiveChild = (item: typeof NAV_ITEMS[RoleCode][number]) => {
    if (!item.children) return false
    return item.children.some(child => pathname === child.href)
  }

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
          'fixed left-0 top-0 z-30 h-screen shadow-lg lg:static flex flex-col overflow-hidden',
          'bg-gradient-to-b from-[#1e5aa8] to-[#2563eb] lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-[20px]',
          'transition-transform duration-300 ease-in-out',
          expanded ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        )}
      >
        {/* Collapse Toggle Button - Moved to TOP */}
        <div className={cn("p-4 border-b border-white/10", expanded ? "" : "flex justify-center")}>
          <button
            onClick={onToggle}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className={cn(
              "flex items-center gap-3 rounded-lg py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white w-full",
              expanded ? "px-4" : "justify-center px-2"
            )}
          >
            {expanded ? (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="whitespace-nowrap overflow-hidden">
                  Collapse
                </span>
              </>
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Logo */}
        <div className={cn("flex flex-col items-center", expanded ? "px-6 pt-8 pb-6" : "px-2 pt-6 pb-4")}>
          <div className={cn("flex items-center justify-center rounded-2xl bg-white transition-all duration-300", expanded ? "h-16 w-16 mb-3" : "h-10 w-10 mb-0")}>
            <span className={cn("font-bold text-[#1e5aa8] transition-all duration-300", expanded ? "text-2xl" : "text-xl")}>S</span>
          </div>
          <div className={cn("text-center overflow-hidden transition-all duration-300", expanded ? "opacity-100 max-h-20" : "opacity-0 max-h-0 lg:hidden")}>
            <h2 className="text-base font-bold text-white">STOVIA</h2>
            <p className="text-xs text-white/90">Lorem Ipsum Dolor Sit Amet</p>
          </div>
        </div>

        {/* Navigation - Hidden scrollbar but scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          <ul className="space-y-0.5">
            {currentNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const hasChildren = item.children && item.children.length > 0
              const isSubmenuOpen = openSubmenu === item.label
              const hasActiveChildItem = hasActiveChild(item)

              if (hasChildren) {
                return (
                  <li key={item.href} className="space-y-0.5">
                    <button
                      onClick={() => setOpenSubmenu(isSubmenuOpen ? null : item.label)}
                      title={!expanded ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg py-3 text-sm transition-all duration-200 text-white w-full',
                        hasActiveChildItem
                          ? 'bg-black/40 font-medium'
                          : 'hover:bg-white/10',
                        expanded ? 'px-4' : 'justify-center px-2'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-200", expanded ? "opacity-100 w-auto" : "opacity-0 w-0 lg:hidden")}>
                        {item.label}
                      </span>
                      {expanded && (
                        <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform duration-200", isSubmenuOpen ? "rotate-180" : "")} />
                      )}
                    </button>
                    {/* Submenu items */}
                    {expanded && isSubmenuOpen && (
                      <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-white/10 pl-3">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon
                          const isChildActive = pathname === child.href
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg py-2.5 text-sm transition-all duration-200 text-white/80 hover:text-white',
                                  isChildActive
                                    ? 'bg-white/10 font-medium text-white'
                                    : 'hover:bg-white/5',
                                  'pl-3'
                                )}
                              >
                                <ChildIcon className="h-4 w-4 shrink-0" />
                                <span className="whitespace-nowrap overflow-hidden">
                                  {child.label}
                                </span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={!expanded ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg py-3 text-sm transition-all duration-200 text-white',
                      isActive
                        ? 'bg-black/40 font-medium'
                        : 'hover:bg-white/10',
                      expanded ? 'px-4' : 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-200", expanded ? "opacity-100 w-auto" : "opacity-0 w-0 lg:hidden")}>
                      {item.label}
                    </span>
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