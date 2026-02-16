
'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Shield,
    UserCheck,
    Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import Card from '@/components/ui/card'
import CardContent from '@/components/ui/card/card-content'
import CardHeader from '@/components/ui/card/card-header'
import CardTitle from '@/components/ui/card/card-title'
import CardDescription from '@/components/ui/card/card-description'
import Button from '@/components/ui/button'
import { userService } from '@/services/user.service'
import { classService } from '@/services/class.service'
import { User } from '@/types/user'
import { Class } from '@/types/class'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    color: string
    bgColor: string
    iconColor: string
}

function StatCard({ title, value, icon: Icon, color, bgColor, iconColor }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-7 w-7 ${iconColor}`} />
                </div>
            </div>
        </div>
    )
}

interface QuickActionProps {
    title: string
    description: string
    icon: React.ElementType
    onClick: () => void
    color: string
}

function QuickAction({ title, description, icon: Icon, onClick, color }: QuickActionProps) {
    return (
        <button
            onClick={onClick}
            className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
        >
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${color} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-xs text-gray-600">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
    )
}

interface RecentActivityItem {
    id: string
    title: string
    description: string
    time: string
    icon: React.ElementType
    iconColor: string
    bgColor: string
}

function RecentActivities() {
    const activities: RecentActivityItem[] = [
        {
            id: '1',
            title: 'New User Registered',
            description: 'John Doe joined as a student',
            time: '5 minutes ago',
            icon: Users,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: '2',
            title: 'Assignment Submitted',
            description: '25 students submitted Math Assignment',
            time: '1 hour ago',
            icon: CheckCircle,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            id: '3',
            title: 'Class Created',
            description: 'Physics 101 - Advanced Mechanics',
            time: '3 hours ago',
            icon: BookOpen,
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            id: '4',
            title: 'System Alert',
            description: 'Database backup completed successfully',
            time: '5 hours ago',
            icon: AlertCircle,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ]

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>Latest system activities and updates</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                        View All
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {activities.map((activity) => {
                        const Icon = activity.icon
                        return (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                            >
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${activity.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${activity.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

interface SystemStatusItem {
    name: string
    status: 'operational' | 'warning' | 'error'
    uptime: string
}

function SystemStatus() {
    const systems: SystemStatusItem[] = [
        { name: 'API Server', status: 'operational', uptime: '99.9%' },
        { name: 'Database', status: 'operational', uptime: '99.8%' },
        { name: 'File Storage', status: 'operational', uptime: '100%' },
        { name: 'Email Service', status: 'operational', uptime: '99.5%' }
    ]

    const getStatusColor = (status: SystemStatusItem['status']) => {
        switch (status) {
            case 'operational':
                return 'bg-green-500'
            case 'warning':
                return 'bg-yellow-500'
            case 'error':
                return 'bg-red-500'
        }
    }

    const getStatusText = (status: SystemStatusItem['status']) => {
        switch (status) {
            case 'operational':
                return 'Operational'
            case 'warning':
                return 'Warning'
            case 'error':
                return 'Error'
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Monitor system health and uptime</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {systems.map((system) => (
                        <div key={system.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${getStatusColor(system.status)} animate-pulse`} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{system.name}</p>
                                    <p className="text-xs text-gray-500">{getStatusText(system.status)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{system.uptime}</p>
                                <p className="text-xs text-gray-500">Uptime</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard() {
    const { data: session } = useSession()
    const router = useRouter()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [classes, setClasses] = useState<Class[]>([])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        fetchData()
    }, [session])

    const fetchData = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)

            // Fetch users and classes in parallel
            const [usersResponse, classesResponse] = await Promise.all([
                userService.getUsers(session.accessToken),
                classService.getClasses(session.accessToken)
            ])

            if (usersResponse && usersResponse.data) {
                setUsers(usersResponse.data)
            }

            if (classesResponse && classesResponse.data) {
                setClasses(classesResponse.data)
            }
        } catch (error: any) {
            console.error('Failed to fetch dashboard data:', error)
            toast.error(error.message || 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    // Calculate statistics from real data
    const totalUsers = users.length
    const adminCount = users.filter(u => ['ADMIN', 'ADM'].includes(u.role_code?.toUpperCase() || '')).length
    const teacherCount = users.filter(u => ['TEACHER', 'GURU', 'TCR'].includes(u.role_code?.toUpperCase() || '')).length
    const studentCount = users.filter(u => ['STUDENT', 'MURID', 'STD'].includes(u.role_code?.toUpperCase() || '')).length
    const totalClasses = classes.length

    const stats = [
        {
            title: 'Total Users',
            value: loading ? '-' : totalUsers,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Administrators',
            value: loading ? '-' : adminCount,
            icon: Shield,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Teachers',
            value: loading ? '-' : teacherCount,
            icon: UserCheck,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600'
        },
        {
            title: 'Students',
            value: loading ? '-' : studentCount,
            icon: GraduationCap,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        }
    ]

    const quickActions = [
        {
            title: 'Manage Users',
            description: 'Add, edit, or remove system users',
            icon: Users,
            color: 'bg-gradient-to-r from-blue-600 to-blue-700',
            onClick: () => router.push('/user-management')
        },
        {
            title: 'Manage Classes',
            description: 'Create and organize classes',
            icon: BookOpen,
            color: 'bg-gradient-to-r from-purple-600 to-purple-700',
            onClick: () => router.push('/class-management')
        },
        {
            title: 'View Assignments',
            description: 'Monitor all assignments and submissions',
            icon: ClipboardList,
            color: 'bg-gradient-to-r from-green-600 to-green-700',
            onClick: () => router.push('/assignments')
        },
        {
            title: 'System Settings',
            description: 'Configure system preferences',
            icon: Shield,
            color: 'bg-gradient-to-r from-orange-600 to-orange-700',
            onClick: () => router.push('/settings')
        }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
                <div className="flex h-[50vh] w-full items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Section - Same style as User Management */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, {session?.user?.fullName || 'Admin'}! Here's what's happening today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {currentTime.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-900">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                    {currentTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid - Same style as User Management */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {quickActions.map((action, index) => (
                                <QuickAction key={index} {...action} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <RecentActivities />
                    <SystemStatus />
                </div>
            </div>
        </div>
    )
}
