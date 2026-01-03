import DashboardLayout from '@/components/layout/DashboardLayout'

export default function ClassManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
          <p className="mt-2 text-gray-600">
            Manage classes, schedules, and classrooms
          </p>
        </div>
        
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Class Management page coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
