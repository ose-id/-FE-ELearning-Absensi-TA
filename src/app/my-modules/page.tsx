import DashboardLayout from '@/components/layout/DashboardLayout'
import MyModulesPage from '@/view/my-modules/MyModulesPage'
import { ROLES } from '@/config/roles'

export default function MyModules() {
    return (
        <DashboardLayout allowedRoles={[ROLES.STUDENT]}>
            <MyModulesPage />
        </DashboardLayout>
    )
}
