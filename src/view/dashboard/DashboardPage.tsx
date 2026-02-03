'use client'

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

import Card from '@/components/ui/card'
import CardHeader from '@/components/ui/card/card-header'
import CardTitle from '@/components/ui/card/card-title'
import CardDescription from '@/components/ui/card/card-description'
import CardContent from '@/components/ui/card/card-content'

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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RecentActivityItem {
  id: string
  title: string
  description: string
  time: string
  icon: React.ElementType
  iconColor: string
}

function RecentActivity() {
  const activities: RecentActivityItem[] = [
    {
      id: '1',
      title: 'Assignment Submitted',
      description: 'Math Assignment - Chapter 5',
      time: '2 hours ago',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    {
      id: '2',
      title: 'New Announcement',
      description: 'School holiday schedule updated',
      time: '5 hours ago',
      icon: AlertCircle,
      iconColor: 'text-blue-600',
    },
    {
      id: '3',
      title: 'Attendance Recorded',
      description: 'Physics class - Present',
      time: '1 day ago',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    {
      id: '4',
      title: 'Grade Updated',
      description: 'English Essay - Grade A',
      time: '2 days ago',
      icon: FileText,
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ${activity.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface UpcomingItem {
  id: string
  title: string
  subject: string
  dueDate: string
  type: 'assignment' | 'exam' | 'class'
}

function UpcomingEvents() {
  const events: UpcomingItem[] = [
    {
      id: '1',
      title: 'Math Quiz',
      subject: 'Mathematics',
      dueDate: 'Tomorrow, 10:00 AM',
      type: 'exam',
    },
    {
      id: '2',
      title: 'History Essay',
      subject: 'History',
      dueDate: 'Jan 10, 2026',
      type: 'assignment',
    },
    {
      id: '3',
      title: 'Chemistry Lab',
      subject: 'Chemistry',
      dueDate: 'Jan 12, 2026',
      type: 'class',
    },
  ]

  const getTypeColor = (type: UpcomingItem['type']) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-700'
      case 'exam':
        return 'bg-red-100 text-red-700'
      case 'class':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Don't miss these important dates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {event.title}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(
                      event.type
                    )}`}
                  >
                    {event.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{event.subject}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{event.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {session?.user?.fullName || 'User'}! 👋
        </h1>
        <p className="mt-2 text-blue-100">
          Here's what's happening with your learning today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,234"
          description="Active this semester"
          icon={Users}
          trend={{ value: '12%', isPositive: true }}
        />
        <StatCard
          title="Active Classes"
          value="48"
          description="Currently running"
          icon={BookOpen}
          trend={{ value: '3%', isPositive: true }}
        />
        <StatCard
          title="Assignments"
          value="156"
          description="Pending review"
          icon={FileText}
          trend={{ value: '8%', isPositive: false }}
        />
        <StatCard
          title="Attendance Rate"
          value="94.5%"
          description="This month"
          icon={TrendingUp}
          trend={{ value: '2.3%', isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <UpcomingEvents />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">View Schedule</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <FileText className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">New Assignment</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <CheckCircle className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Take Attendance</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <Users className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
