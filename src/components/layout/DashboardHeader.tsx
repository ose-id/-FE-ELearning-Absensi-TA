'use client'

import { useSession, signOut } from 'next-auth/react'
import {
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react'

import Button from '@/components/ui/button'
import DropdownMenu from '@/components/ui/dropdown-menu'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/dropdown-menu-trigger'
import DropdownMenuContent from '@/components/ui/dropdown-menu/dropdown-menu-content'
import DropdownMenuItem from '@/components/ui/dropdown-menu/dropdown-menu-item'
import DropdownMenuSeparator from '@/components/ui/dropdown-menu/dropdown-menu-separator'
import DropdownMenuLabel from '@/components/ui/dropdown-menu/dropdown-menu-label'

interface HeaderProps {
  onMenuClick: () => void
  sidebarExpanded: boolean
}

export default function DashboardHeader({ onMenuClick, sidebarExpanded }: HeaderProps) {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div>
      {/* Top Navbar - removed border */}
      <header className="flex items-center justify-between bg-white px-6 py-4">
        {/* Left side - Menu Button (Mobile) */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Right side - User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden text-sm font-medium sm:inline-block">
                {session?.user?.fullName || 'Administrator'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session?.user?.fullName || 'Administrator User'}</p>
                <p className="text-xs text-gray-500">{session?.user?.email || 'admin@example.com'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Page Title and Breadcrumb - no background or card styling */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
    </div>
  )
}

