import DashboardLayout from '@/components/layout/DashboardLayout'
import AttendanceManagementView from '@/view/attendance-management/AttendanceManagementPage'

export default function AttendancePage() {
    return (
        <DashboardLayout>
            <AttendanceManagementView />
        </DashboardLayout>
    )
}
