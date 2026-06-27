import DashboardLayout from '@/components/layout/DashboardLayout'
import SubjectManagementView from '@/view/subject-management/SubjectManagementPage'
import { ROLES } from '@/config/roles'

export default function SubjectManagementPage() {
    return (
        <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
            <SubjectManagementView />
        </DashboardLayout>
    )
}
