'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, FileText } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Card from '@/components/ui/card'
import CardHeader from '@/components/ui/card/card-header'
import CardTitle from '@/components/ui/card/card-title'
import CardDescription from '@/components/ui/card/card-description'
import CardContent from '@/components/ui/card/card-content'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { assignmentService } from '@/services/assignment.service'
import { Assignment } from '@/types/assignment'
import StudentAssignmentCard from './StudentAssignmentCard'

export default function StudentAssignmentsPage() {
    const { data: session } = useSession()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

    const fetchData = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)

            const assignmentsRes = await assignmentService.getMyAssignments(session.accessToken).catch(err => {
                console.error("Failed to fetch assignments", err)
                return { data: [] }
            })

            if (assignmentsRes && assignmentsRes.data) {
                setAssignments(assignmentsRes.data)
            }

        } catch (error: any) {
            console.error('Failed to fetch data:', error)
            toast.error(error.message || 'Failed to load assignments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [session])

    const handleViewDetail = (assignment: Assignment) => {
        toast.info('Assignment detail view coming soon!')
    }

    const filteredAssignments = assignments.filter((assignment) => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return true

        const title = assignment.title?.toLowerCase() || ''
        const description = assignment.description?.toLowerCase() || ''
        const className = assignment.class_name?.toLowerCase() || ''

        return title.includes(term) || description.includes(term) || className.includes(term)
    })

    const getSubmissionStatus = (assignment: Assignment): 'not_submitted' | 'submitted' | 'graded' => {
        return 'not_submitted'
    }

    const tabs = [
        { key: 'all' as const, label: 'All', count: filteredAssignments.length },
        { key: 'pending' as const, label: 'Pending', count: filteredAssignments.filter(a => getSubmissionStatus(a) === 'not_submitted').length },
        { key: 'submitted' as const, label: 'Submitted', count: filteredAssignments.filter(a => getSubmissionStatus(a) === 'submitted').length },
        { key: 'graded' as const, label: 'Graded', count: filteredAssignments.filter(a => getSubmissionStatus(a) === 'graded').length },
    ]

    const displayedAssignments = activeTab === 'all'
        ? filteredAssignments
        : filteredAssignments.filter(a => {
            const status = getSubmissionStatus(a)
            if (activeTab === 'pending') return status === 'not_submitted'
            if (activeTab === 'submitted') return status === 'submitted'
            if (activeTab === 'graded') return status === 'graded'
            return true
        })

    if (loading && assignments.length === 0) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading assignments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        My Assignments
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        View and submit your assignments
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {tabs.map((tab) => (
                    <Card
                        key={tab.key}
                        className={`cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                            activeTab === tab.key ? 'ring-2 ring-blue-500 border-blue-500' : ''
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{tab.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                    activeTab === tab.key ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                    <FileText className={`h-5 w-5 ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-500'}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Assignments</CardTitle>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 w-full sm:w-80">
                            <Search className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <Input
                                className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                                placeholder="Search assignments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {displayedAssignments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">
                                {searchTerm ? 'No assignments found' : 'No assignments available'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {searchTerm ? 'Try a different search term' : 'Check back later'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {displayedAssignments.map((assignment) => (
                                <StudentAssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onViewDetail={handleViewDetail}
                                    submissionStatus={getSubmissionStatus(assignment)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
