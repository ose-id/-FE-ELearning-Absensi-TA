import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import AssignmentManagementPage from '@/view/assignment-management/AssignmentManagementPage'

export default async function Page() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/')
    }

    // Only allow Admin and Teacher roles
    const allowedRoles = ['ADM', 'TCR', 'Admin', 'Teacher', 'Guru']
    if (!allowedRoles.includes(session.user.vrole_code) && !allowedRoles.includes(session.user.vrole_name)) {
        redirect('/dashboard')
    }

    return <AssignmentManagementPage />
}
