'use client'

import { Calendar, BookOpen, Award, FileText } from 'lucide-react'
import { Assignment } from '@/types/assignment'
import Button from '@/components/ui/button'

interface StudentAssignmentCardProps {
    assignment: Assignment
    onViewDetail: (assignment: Assignment) => void
    submissionStatus?: 'not_submitted' | 'submitted' | 'graded'
    score?: number
}

export default function StudentAssignmentCard({
    assignment,
    onViewDetail,
    submissionStatus = 'not_submitted',
    score,
}: StudentAssignmentCardProps) {
    const getStatusBadge = () => {
        if (submissionStatus === 'graded') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-800">
                    <Award className="h-3 w-3" />
                    Graded
                </span>
            )
        } else if (submissionStatus === 'submitted') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                    Submitted
                </span>
            )
        } else {
            const due = new Date(assignment.due_date)
            const now = new Date()
            const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays < 0) {
                return (
                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-800">
                        Overdue
                    </span>
                )
            } else if (diffDays <= 3) {
                return (
                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Due Soon
                    </span>
                )
            } else {
                return (
                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800">
                        Pending
                    </span>
                )
            }
        }
    }

    const getStatusColor = () => {
        if (submissionStatus === 'graded') return 'from-green-400 to-green-600'
        if (submissionStatus === 'submitted') return 'from-blue-400 to-blue-600'
        const due = new Date(assignment.due_date)
        const now = new Date()
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays < 0) return 'from-red-400 to-red-600'
        if (diffDays <= 3) return 'from-yellow-400 to-yellow-600'
        return 'from-gray-400 to-gray-600'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b ${getStatusColor()}`} />

            <div className="flex items-start justify-between mb-4 pl-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-6 w-6 text-blue-600" />
                </div>
                {getStatusBadge()}
            </div>

            <div className="space-y-3 pl-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {assignment.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        <BookOpen className="h-3 w-3" />
                        {assignment.class_name || `Class ${assignment.class_id}`}
                    </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                    {assignment.description}
                </p>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>Max: {assignment.max_score}</span>
                        {score !== undefined && (
                            <span className="ml-1 font-semibold text-green-600">
                                ({score})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 pl-3">
                <Button
                    onClick={() => onViewDetail(assignment)}
                    variant={submissionStatus === 'not_submitted' ? 'default' : 'outline'}
                    className={`w-full ${
                        submissionStatus === 'not_submitted'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {submissionStatus === 'not_submitted' ? 'Submit Assignment' : 'View Details'}
                </Button>
            </div>
        </div>
    )
}
