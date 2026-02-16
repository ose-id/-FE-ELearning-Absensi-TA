
'use client'

import { Calendar, BookOpen, Award } from 'lucide-react'
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen className="h-4 w-4" />
                        <span>{assignment.class_name || `Class ${assignment.class_id}`}</span>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {assignment.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>Max: {assignment.max_score}</span>
                        {score !== undefined && (
                            <span className="ml-1 font-semibold text-green-600">
                                (Score: {score})
                            </span>
                        )}
                    </div>
                </div>

                <Button
                    onClick={() => onViewDetail(assignment)}
                    variant={submissionStatus === 'not_submitted' ? 'default' : 'outline'}
                    size="sm"
                    className={submissionStatus === 'not_submitted' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                    {submissionStatus === 'not_submitted' ? 'Submit' : 'View Details'}
                </Button>
            </div>
        </div>
    )
}
