
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

            {/* Teaching Tips & Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Teaching Tips */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="h-4.5 w-4.5 text-blue-600" />
                            Teaching Tips
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <article className="group flex gap-4 p-3 rounded-xl hover:bg-blue-50/50 transition-colors cursor-default">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Create Engaging Materials</h4>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    Upload diverse content types — documents, presentations, and videos — to keep students engaged with varied learning materials.
                                </p>
                            </div>
                        </article>
                        <article className="group flex gap-4 p-3 rounded-xl hover:bg-purple-50/50 transition-colors cursor-default">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Set Up Quizzes Early</h4>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    Prepare quizzes and exams in advance with clear passing scores and time limits so students know what to expect.
                                </p>
                            </div>
                        </article>
                        <article className="group flex gap-4 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors cursor-default">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Track Assignment Deadlines</h4>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    Set clear due dates for assignments and monitor submission progress to ensure timely student participation.
                                </p>
                            </div>
                        </article>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
                            Recent Updates
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <article className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 mt-0.5">
                                <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Grading Reminder</h4>
                                <p className="text-xs text-gray-500 mt-0.5">You have pending assignments that need to be reviewed and graded.</p>
                            </div>
                        </article>
                        <article className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 mt-0.5">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Student Performance</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Overall student performance has improved this semester. Keep up the great work!</p>
                            </div>
                        </article>
                        <article className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 mt-0.5">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Module Setup Complete</h4>
                                <p className="text-xs text-gray-500 mt-0.5">All your learning modules are set up and ready for the current semester.</p>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    )
}
