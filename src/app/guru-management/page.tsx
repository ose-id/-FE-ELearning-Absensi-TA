'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import BaseUserManagementPage from '@/view/user-management/BaseUserManagementPage'
import { UserCheck } from 'lucide-react'

export default function GuruManagementPage() {
    return (
        <DashboardLayout>
            <BaseUserManagementPage
                category="teacher"
                endpoint={`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://localhost:5001'}/api/Teacher`}
                title="Guru Management"
                description="Manage teacher accounts and profiles"
                roleNid={2}
                icon={UserCheck}
                statsIcon={UserCheck}
                statsColor={{
                    iconColor: 'text-indigo-600',
                    bgColor: 'bg-indigo-50',
                    color: 'from-indigo-500 to-indigo-600'
                }}
            />
        </DashboardLayout>
    )
}
