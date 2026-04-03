import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import StudentAssignmentsPage from '@/view/student-assignments/StudentAssignmentsPage'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function Page() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/')
    }

    // Only allow Student role
    const allowedRoles = ['STD', 'Student', 'Murid', 'MR']
    if (!allowedRoles.includes(session.user.vrole_code) && !allowedRoles.includes(session.user.vrole_name)) {
        redirect('/dashboard')
    }

    return (
        <DashboardLayout>
            <StudentAssignmentsPage />
        </DashboardLayout>
    )
}
