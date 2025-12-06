import { LayoutDashboard, LineChart, BookOpenCheck, Lightbulb, Map, FileSearch, UserCogIcon, Archive } from 'lucide-react'

export const MENUS = [
  // {
  //   title: 'Dashboard',
  //   icon: LayoutDashboard,
  //   href: '/dashboard',
  //   children: [
  //     { title: 'Content', href: '/dashboard/content' },
  //     { title: 'Audience', href: '/dashboard/audience' },
  //     { title: 'Traffic Sources', href: '/dashboard/traffic-source' },
  //     { title: 'Device', href: '/dashboard/device' },
  //     { title: 'Geography', href: '/dashboard/geography' }
  //   ]
  // },
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'Assignment', icon: Lightbulb, href: '/assignment' },
  { title: 'Attendance', icon: LineChart, href: '/attendance' },
  { title: 'Class Management', icon: Map, href: '/class-management' },
  { title: 'Reporting', icon: BookOpenCheck, href: '/reporting' },
  { title: 'Subjects', icon: FileSearch, href: '/subjects' },
  { title: 'User Management', icon: UserCogIcon, href: '/user-management' },
  { title: 'Master', icon: Archive, href: '/master' }
]
