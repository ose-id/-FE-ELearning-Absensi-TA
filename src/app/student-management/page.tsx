'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import BaseUserManagementPage from '@/view/user-management/BaseUserManagementPage'
import { GraduationCap } from 'lucide-react'
import { ROLES } from '@/config/roles'

export default function StudentManagementPage() {
    return (
        <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
            <BaseUserManagementPage
                category="student"
                endpoint={`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://localhost:5001'}/api/Student`}
                title="Student Management"
                description="Manage student accounts and enrollments"
                roleNid={3}
                icon={GraduationCap}
                statsIcon={GraduationCap}
                statsColor={{
                    iconColor: 'text-green-600',
                    bgColor: 'bg-green-50',
                    color: 'from-green-500 to-green-600'
                }}
            />
        </DashboardLayout>
    )
}
