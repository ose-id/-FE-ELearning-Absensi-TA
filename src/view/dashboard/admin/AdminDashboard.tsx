
'use client'

import { useSession } from 'next-auth/react'
import {
    Users,
    Building2,
    AlertCircle,
    TrendingUp,
    Server
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                        <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard() {
    const { data: session } = useSession()

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
                <h1 className="text-2xl font-bold">
                    Admin Dashboard - {session?.user?.fullName}
                </h1>
                <p className="mt-2 text-purple-100">
                    System Overview and User Management
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value="2,543" icon={Users} />
                <StatCard title="Total Classes" value="142" icon={Building2} />
                <StatCard title="System Load" value="Normal" icon={Server} />
                <StatCard title="Issues Reported" value="3" icon={AlertCircle} />
            </div>
        </div>
    )
}
