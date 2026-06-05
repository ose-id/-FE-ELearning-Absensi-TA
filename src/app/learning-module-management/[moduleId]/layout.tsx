import DashboardLayout from '@/components/layout/DashboardLayout'

export default function LearningModuleSubLayout({
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
