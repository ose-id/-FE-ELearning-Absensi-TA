import DashboardLayout from '@/components/layout/DashboardLayout'
import UserManagementPage from '@/view/user-management/UserManagementPage'

export default function Page() {
  return (
    <DashboardLayout>
      <UserManagementPage />
    </DashboardLayout>
  )
}
