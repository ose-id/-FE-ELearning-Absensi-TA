import DashboardLayout from '@/components/layout/DashboardLayout'
import SchoolTermManagementPage from '@/view/school-term-management/SchoolTermManagementPage'
import { ROLES } from '@/config/roles'

export default function Page() {
  return (
    <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
      <SchoolTermManagementPage />
    </DashboardLayout>
  )
}