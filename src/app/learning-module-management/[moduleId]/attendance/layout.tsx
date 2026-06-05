import DashboardLayout from '@/components/layout/DashboardLayout'

export default function AttendanceModuleLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}
