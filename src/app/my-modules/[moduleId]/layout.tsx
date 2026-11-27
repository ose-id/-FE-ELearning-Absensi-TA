'use client'

import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function MyModulesDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isQuizTaking = pathname.includes('/quiz/')

    return (
        <DashboardLayout hideHeader={isQuizTaking}>
            {children}
        </DashboardLayout>
    )
}
