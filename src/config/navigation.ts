
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
    CalendarDays,
    Shield,
    UserCheck,
    ChevronDown,
    BookText,
    FolderOpen
} from 'lucide-react'
import { ROLES, type RoleCode } from './roles'

type NavItem = {
    icon: any
    label: string
    href: string
    children?: NavItem[]
}

export const NAV_ITEMS: Record<RoleCode, NavItem[]> = {
    // Admin Navigation
    [ROLES.ADMIN]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        {
            icon: Users,
            label: 'User Management',
            href: '#',
            children: [
                { icon: Shield, label: 'Admin Management', href: '/admin-management' },
                { icon: UserCheck, label: 'Guru Management', href: '/guru-management' },
                { icon: GraduationCap, label: 'Murid Management', href: '/student-management' },
            ]
        },
        // { icon: ShieldCheck, label: 'Role Management', href: '/role-management' },
        { icon: Building2, label: 'Department', href: '/department-management' },
        { icon: CalendarDays, label: 'Academic Year', href: '/academic-year-management' },
        { icon: Target, label: 'School Term', href: '/school-term-management' },
        { icon: Building2, label: 'Class', href: '/class-management' },
        { icon: BookMarked, label: 'Subject', href: '/subject-management' },
        { icon: BookText, label: 'Teacher Subject', href: '/teacher-subject-management' },
        { icon: BarChart3, label: 'Reporting', href: '/reporting' },
        { icon: Settings, label: 'System Settings', href: '/settings' },
    ],

    // Teacher Navigation
    [ROLES.TEACHER]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Building2, label: 'Department', href: '/department-management' },
        { icon: BookOpen, label: 'Learning Module', href: '/learning-module-management' },
        { icon: FolderOpen, label: 'Question Bank', href: '/question-bank' },
    ],

    // Student Navigation
    [ROLES.STUDENT]: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: BookOpen, label: 'Learning Module', href: '/learning-module' },
        { icon: BookOpen, label: 'My Modules', href: '/my-modules' },
        { icon: GraduationCap, label: 'My Grades', href: '/my-grades' },
    ],
}
