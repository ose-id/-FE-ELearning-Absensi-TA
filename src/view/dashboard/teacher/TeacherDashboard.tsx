
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Users,
    BookOpen,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
} from 'lucide-react'

import { classService } from '@/services/class.service'
import { assignmentService } from '@/services/assignment.service'

import Card from '@/components/ui/card'
import CardHeader from '@/components/ui/card/card-header'
import CardTitle from '@/components/ui/card/card-title'
import CardDescription from '@/components/ui/card/card-description'
import CardContent from '@/components/ui/card/card-content'

// Reuse local components for now (in real app they should be shared components)
// ... (I will include the StatCard, RecentActivity, UpcomingEvents definitions here)

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon: React.ElementType
    trend?: {
        value: string
        isPositive: boolean
    }
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {trend && (
                        <span
                            className={`flex items-center text-sm font-semibold ${trend.isPositive ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full' : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full'
                                }`}
                        >
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="mt-1 text-xs text-gray-500">{description}</p>
                )}
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${title.includes('Students') ? 'bg-blue-50' :
                title.includes('Classes') ? 'bg-purple-50' :
                    title.includes('Grading') ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                <Icon className={`h-6 w-6 ${title.includes('Students') ? 'text-blue-600' :
                    title.includes('Classes') ? 'text-purple-600' :
                        title.includes('Grading') ? 'text-amber-600' : 'text-emerald-600'
                    }`} />
            </div>
        </div>
    )
}

// ... Additional helper components would go here, simplified for brevity in this step ...

export default function TeacherDashboard() {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen space-y-8 pb-10">
            {/* Unique Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 text-white shadow-xl lg:p-12">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Welcome back, {session?.user?.fullName || 'Teacher'}! 👋
                    </h1>
                    <p className="text-lg text-blue-100/90 leading-relaxed">
                        Manage your classes, track student progress, and organize your teaching schedule all in one place.
                    </p>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" />
            </div>

            {/* Teacher specific stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1">
                    <StatCard title="My Students" value="120" icon={Users} trend={{ value: '5%', isPositive: true }} />
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-2xl" />
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-purple-200 hover:-translate-y-1">
                    <StatCard title="Active Classes" value="4" icon={BookOpen} />
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600 rounded-l-2xl" />
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber-200 hover:-translate-y-1">
                    <StatCard title="Pending Grading" value="15" icon={FileText} trend={{ value: '2', isPositive: false }} />
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-2xl" />
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1">
                    <StatCard title="Avg Attendance" value="92%" icon={TrendingUp} trend={{ value: '1%', isPositive: true }} />
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-l-2xl" />
                </div>
            </div>

            {/* Recent Activity & Upcoming Events (Placeholder for layout structure if needed in future) */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* We can add the RecentActivity and UpcomingEvents components here later, styled similarly */}
            </div>
        </div>
    )
}
