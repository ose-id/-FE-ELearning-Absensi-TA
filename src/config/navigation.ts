
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
    ShieldCheck
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
        { icon: Building2, label: 'Class Management', href: '/class-management' },
        { icon: Target, label: 'Subjects', href: '/subjects' },
        { icon: BarChart3, label: 'Reporting', href: '/reporting' },
        { icon: Settings, label: 'System Settings', href: '/settings' },
    ],

    // Teacher Navigation
    [ROLES.TEACHER]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Building2, label: 'My Classes', href: '/class-management' }, // Reusing class management for now
        { icon: BookOpen, label: 'Materials', href: '/materials' },
        { icon: Briefcase, label: 'Assignments', href: '/assignment' },
        { icon: Calendar, label: 'Attendance', href: '/attendance' },
        { icon: BarChart3, label: 'Student Grades', href: '/grades' },
    ],

    // Student Navigation
    [ROLES.STUDENT]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Building2, label: 'My Classes', href: '/my-classes' },
        { icon: Briefcase, label: 'My Assignments', href: '/my-assignments' },
        { icon: Calendar, label: 'Schedule', href: '/schedule' },
        { icon: GraduationCap, label: 'My Grades', href: '/my-grades' },
    ],
}
