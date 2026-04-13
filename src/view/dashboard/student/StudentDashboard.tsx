
'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
    BookOpen,
    Building2,
    Calendar,
    CheckCircle,
    FileText,
    Clock,
    GraduationCap,
    TrendingUp,
    Award,
    Target,
    Loader2,
    ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import Card from '@/components/ui/card'
import CardContent from '@/components/ui/card/card-content'
import CardHeader from '@/components/ui/card/card-header'
import CardTitle from '@/components/ui/card/card-title'
import CardDescription from '@/components/ui/card/card-description'
import Button from '@/components/ui/button'
import { classService } from '@/services/class.service'
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

export default function StudentDashboard() {
    const { data: session } = useSession()
    const router = useRouter()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [loading, setLoading] = useState(true)
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

            const classesResponse = await classService.getEnrolledClasses(session.accessToken)

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

    const enrolledClasses = classes.length
    const assignmentsDue = 2 // TODO: Get from assignments API
    const attendance = '95%' // TODO: Calculate from attendance API
    const upcomingExams = 1 // TODO: Get from exams API

    const stats = [
        {
            title: 'Enrolled Classes',
            value: loading ? '-' : enrolledClasses,
            icon: BookOpen,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Assignments Due',
            value: assignmentsDue,
            icon: FileText,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            title: 'Attendance',
            value: attendance,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Upcoming Exams',
            value: upcomingExams,
            icon: Calendar,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        }
    ]

    const quickActions = [
        {
            title: 'Browse Classes',
            description: 'Find and enroll in new classes',
            icon: BookOpen,
            color: 'bg-gradient-to-r from-blue-600 to-blue-700',
            onClick: () => router.push('/class-catalog')
        },
        {
            title: 'My Classes',
            description: 'View your enrolled classes',
            icon: Building2,
            color: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
            onClick: () => router.push('/my-classes')
        },
        {
            title: 'Assignments',
            description: 'Check and submit your assignments',
            icon: FileText,
            color: 'bg-gradient-to-r from-orange-600 to-orange-700',
            onClick: () => router.push('/my-assignments')
        },
        {
            title: 'Attendance',
            description: 'View your attendance records',
            icon: CheckCircle,
            color: 'bg-gradient-to-r from-green-600 to-green-700',
            onClick: () => router.push('/attendance')
        },
        {
            title: 'Grades',
            description: 'Check your grades and performance',
            icon: Award,
            color: 'bg-gradient-to-r from-purple-600 to-purple-700',
            onClick: () => router.push('/my-grades')
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
                            Hi, {session?.user?.fullName}! 👋
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Ready to learn something new today?
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

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Access your most used features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {quickActions.map((action, index) => (
                                <QuickAction key={index} {...action} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* My Classes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>My Classes</CardTitle>
                                <CardDescription>Your enrolled classes this semester</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/class-management')}>
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {classes.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">No classes enrolled yet</p>
                                <p className="text-sm text-gray-500 mt-1">Contact your administrator to enroll in classes</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {classes.slice(0, 6).map((classItem) => (
                                    <div
                                        key={classItem.nid}
                                        className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                                        onClick={() => router.push(`/class-management/${classItem.nid}`)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                Active
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                            {classItem.vname}
                                        </h4>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                            {classItem.vdesc || 'No description available'}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Class Code: {classItem.nid}</span>
                                            <ArrowRight className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
