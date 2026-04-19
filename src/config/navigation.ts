
import {
    Home,
    Users,
    Building2,
    Target,
    Briefcase,
    Calendar,
    BarChart3,
    Settings,
    BookOpen,
    GraduationCap,
    ShieldCheck,
    BookMarked,
    ClipboardCheck,
    CalendarDays
} from 'lucide-react'
import { ROLES, type RoleCode } from './roles'

type NavItem = {
    icon: any
    label: string
    href: string
}

export const NAV_ITEMS: Record<RoleCode, NavItem[]> = {
    // Admin Navigation
    [ROLES.ADMIN]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Users, label: 'User Management', href: '/user-management' },
        { icon: ShieldCheck, label: 'Role Management', href: '/role-management' },
        { icon: Building2, label: 'Department', href: '/department-management' },
        { icon: CalendarDays, label: 'Academic Year', href: '/academic-year-management' },
        { icon: Target, label: 'School Term', href: '/school-term-management' },
        { icon: Building2, label: 'Class', href: '/class-management' },
        { icon: BarChart3, label: 'Reporting', href: '/reporting' },
        { icon: Settings, label: 'System Settings', href: '/settings' },
    ],

    // Teacher Navigation
    [ROLES.TEACHER]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Building2, label: 'Department', href: '/department-management' },
        { icon: BookMarked, label: 'Subject', href: '/subject-management' },
        { icon: Building2, label: 'Class', href: '/class-management' },
        { icon: BookOpen, label: 'Learning Module', href: '/learning-module-management' },
        { icon: ClipboardCheck, label: 'Attendance', href: '/attendance' },
        { icon: Briefcase, label: 'Assignments', href: '/assignment' },
    ],

    // Student Navigation
    [ROLES.STUDENT]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: BookOpen, label: 'Class Catalog', href: '/class-catalog' },
        { icon: Building2, label: 'My Classes', href: '/my-classes' },
        { icon: BookOpen, label: 'My Modules', href: '/my-modules' },
        { icon: Briefcase, label: 'My Assignments', href: '/my-assignments' },
        { icon: ClipboardCheck, label: 'My Attendance', href: '/attendance' },
        { icon: GraduationCap, label: 'My Grades', href: '/my-grades' },
    ],
}
