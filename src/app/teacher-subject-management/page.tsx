import DashboardLayout from '@/components/layout/DashboardLayout'
import TeacherSubjectManagementView from '@/view/teacher-subject-management/TeacherSubjectManagementPage'
import { ROLES } from '@/config/roles'

export default function TeacherSubjectManagementPage() {
    return (
        <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
            <TeacherSubjectManagementView />
        </DashboardLayout>
    )
}
