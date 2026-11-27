import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import AssignmentManagementPage from '@/view/assignment-management/AssignmentManagementPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ROLES } from '@/config/roles'

export default async function Page() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/')
    }

    return (
        <DashboardLayout allowedRoles={[ROLES.TEACHER]}>
            <AssignmentManagementPage />
        </DashboardLayout>
    )
}
