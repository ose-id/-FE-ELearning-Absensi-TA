import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import StudentAssignmentsPage from '@/view/student-assignments/StudentAssignmentsPage'

export default async function Page() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/')
    }

    // Only allow Student role
    const allowedRoles = ['STD', 'Student', 'Murid']
    if (!allowedRoles.includes(session.user.roleCode) && !allowedRoles.includes(session.user.roleName)) {
        redirect('/dashboard')
    }

    return <StudentAssignmentsPage />
}
