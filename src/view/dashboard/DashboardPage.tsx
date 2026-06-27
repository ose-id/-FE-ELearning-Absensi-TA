'use client'

import { useSession } from 'next-auth/react'
import { Loader } from 'lucide-react'

import AdminDashboard from './admin/AdminDashboard'
import TeacherDashboard from './teacher/TeacherDashboard'
import StudentDashboard from './student/StudentDashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const rawRole = session?.user?.vrole_code || ''
  const roleCode = rawRole.toUpperCase()

  // Debug – visible in browser console
  console.log('[DashboardPage] vrole_code from session:', rawRole, '→ normalized:', roleCode)

  // Admin
  if (['ADM', 'ADMIN'].includes(roleCode)) {
    return <AdminDashboard />
  }

  // Teacher / Guru
  if (['GR', 'TCR', 'TEACHER', 'GURU'].includes(roleCode)) {
    return <TeacherDashboard />
  }

  // Student / Murid
  if (['MR', 'STD', 'STUDENT', 'MURID'].includes(roleCode)) {
    return <StudentDashboard />
  }

  // Fallback – show raw role so it's easy to spot
  console.warn('[DashboardPage] Unknown role code:', roleCode, '- falling back to StudentDashboard')
  return <StudentDashboard />
}
