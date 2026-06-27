import DashboardLayout from '@/components/layout/DashboardLayout'
import AcademicYearManagementPage from '@/view/academic-year-management/AcademicYearManagementPage'
import { ROLES } from '@/config/roles'

export default function Page() {
  return (
    <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
      <AcademicYearManagementPage />
    </DashboardLayout>
  )
}