
'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Filter } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

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
        // TODO: Navigate to assignment detail page or open modal
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

    // Mock submission status - in real app, this would come from API
    const getSubmissionStatus = (assignment: Assignment): 'not_submitted' | 'submitted' | 'graded' => {
        // TODO: Get actual submission status from API
        return 'not_submitted'
    }

    const tabs = [
        { key: 'all' as const, label: 'All Assignments', count: filteredAssignments.length },
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                <p className="text-sm text-gray-500">
                    View and submit your assignments
                </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                    className="border-none text-black bg-transparent focus-visible:ring-0"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                                ${activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }
                            `}
                        >
                            {tab.label}
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : displayedAssignments.length === 0 ? (
                <div className="rounded-md border p-8 text-center text-gray-500">
                    No assignments found.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
    )
}
