import DashboardLayout from '@/components/layout/DashboardLayout'

export default function UserManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage users, roles, and permissions
          </p>
        </div>
        
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">User Management page coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
