
import DashboardLayout from '@/components/layout/DashboardLayout'
import ClassManagementView from '@/view/class-management/ClassManagementPage'
import { ROLES } from '@/config/roles'

export default function Page() {
  return (
    <DashboardLayout allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
      <ClassManagementView />
    </DashboardLayout>
  )
}
