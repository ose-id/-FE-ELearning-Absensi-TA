import DashboardLayout from '@/components/layout/DashboardLayout'

export default function MyModulesDetailLayout({
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
