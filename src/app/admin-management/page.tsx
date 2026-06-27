'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import BaseUserManagementPage, { UserCategory } from '@/view/user-management/BaseUserManagementPage'
import { Shield } from 'lucide-react'
import { ROLES } from '@/config/roles'

export default function AdminManagementPage() {
    return (
        <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
            <BaseUserManagementPage
                category="admin"
                endpoint={`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://localhost:5001'}/api/User/staff`}
                title="Administrator Management"
                description="Manage system administrators and staff accounts"
                roleNid={1}
                icon={Shield}
                statsIcon={Shield}
                statsColor={{
                    iconColor: 'text-purple-600',
                    bgColor: 'bg-purple-50',
                    color: 'from-purple-500 to-purple-600'
                }}
            />
        </DashboardLayout>
    )
}
