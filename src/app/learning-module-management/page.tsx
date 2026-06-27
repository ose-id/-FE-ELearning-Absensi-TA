import DashboardLayout from '@/components/layout/DashboardLayout'
import LearningModuleManagementView from '@/view/learning-module-management/LearningModuleManagementPage'
import { ROLES } from '@/config/roles'

export default function LearningModuleManagementPage() {
    return (
        <DashboardLayout allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
            <LearningModuleManagementView />
        </DashboardLayout>
    )
}
