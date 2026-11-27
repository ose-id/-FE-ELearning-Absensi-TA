import DashboardLayout from '@/components/layout/DashboardLayout'
import DepartmentManagementView from '@/view/department-management/DepartmentManagementPage'
import { ROLES } from '@/config/roles'

export default function DepartmentManagementPage() {
    return (
        <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
            <DepartmentManagementView />
        </DashboardLayout>
    )
}
