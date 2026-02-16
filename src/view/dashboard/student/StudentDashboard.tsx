
'use client'

import { useSession } from 'next-auth/react'
import {
    BookOpen,
    Calendar,
    CheckCircle,
    FileText
} from 'lucide-react'

import Card from '@/components/ui/card'
import CardContent from '@/components/ui/card/card-content'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ElementType
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                        <Icon className="h-6 w-6 text-green-600" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function StudentDashboard() {
    const { data: session } = useSession()

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h1 className="text-2xl font-bold">
                    Hi, {session?.user?.fullName}! 👋
                </h1>
                <p className="mt-2 text-green-100">
                    Ready to learn something new today?
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Enrolled Classes" value="6" icon={BookOpen} />
                <StatCard title="Assignments Due" value="2" icon={FileText} />
                <StatCard title="Attendance" value="95%" icon={CheckCircle} />
                <StatCard title="Upcoming Exams" value="1" icon={Calendar} />
            </div>
        </div>
    )
}
