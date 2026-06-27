import ClassCatalogPage from '@/view/learning-module/ClassCatalogPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ROLES } from '@/config/roles'

export default function LearningModulePage() {
  return (
    <DashboardLayout allowedRoles={[ROLES.STUDENT]}>
      <ClassCatalogPage />
    </DashboardLayout>
  )
}
