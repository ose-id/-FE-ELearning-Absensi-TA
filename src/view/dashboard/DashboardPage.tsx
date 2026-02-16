'use client'

import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

import { ROLES, type RoleCode } from '@/config/roles'
import AdminDashboard from './admin/AdminDashboard'
import TeacherDashboard from './teacher/TeacherDashboard'
import StudentDashboard from './student/StudentDashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const roleCode = session?.user?.roleCode as RoleCode

  switch (roleCode) {
    case ROLES.ADMIN:
      return <AdminDashboard />
    case ROLES.TEACHER:
      return <TeacherDashboard />
    case ROLES.STUDENT:
      return <StudentDashboard />
    default:
      // Fallback or unauthorized view
      return <StudentDashboard />
  }
}
