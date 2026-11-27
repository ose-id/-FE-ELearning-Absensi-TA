'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Users, FileText, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { assignmentService } from '@/services/assignment.service'
import { Submission, GradeSubmissionRequest } from '@/types/assignment'

import Dialog from '@/components/ui/dialog'
import DialogContent from '@/components/ui/dialog/dialog-content'
import DialogDescription from '@/components/ui/dialog/dialog-description'
import DialogFooter from '@/components/ui/dialog/dialog-footer'
import DialogHeader from '@/components/ui/dialog/dialog-header'
import DialogTitle from '@/components/ui/dialog/dialog-title'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea/Textarea'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'

interface SubmissionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    assignment: any
}

export default function SubmissionsDialog({ open, onOpenChange, assignment }: SubmissionsDialogProps) {
    const { data: session } = useSession()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(false)
    const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null)
    const [gradeValue, setGradeValue] = useState('')
    const [feedback, setFeedback] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open && assignment && session?.accessToken) {
            fetchSubmissions()
        }
    }, [open, assignment, session])

    const fetchSubmissions = async () => {
        if (!session?.accessToken || !assignment) return

        try {
            setLoading(true)
            const res = await assignmentService.getSubmissions(assignment.id, session.accessToken)
            setSubmissions(res.data || [])
        } catch (error: any) {
            console.error('Failed to fetch submissions:', error)
            toast.error(error.message || 'Failed to load submissions')
        } finally {
            setLoading(false)
        }
    }

    const handleGrade = (submission: Submission) => {
        setGradingSubmission(submission)
        setGradeValue(submission.score?.toString() || '')
        setFeedback(submission.feedback || '')
    }

    const handleSubmitGrade = async () => {
        if (!session?.accessToken || !gradingSubmission) return

        try {
            setSubmitting(true)
            const data: GradeSubmissionRequest = {
                score: Number(gradeValue),
                feedback: feedback
            }
            await assignmentService.gradeSubmission(
                gradingSubmission.assignment_id,
                gradingSubmission.student_id,
                data,
                session.accessToken
            )
            toast.success('Grade submitted successfully!')
            setGradingSubmission(null)
            fetchSubmissions()
        } catch (error: any) {
            console.error('Failed to grade:', error)
            toast.error(error.message || 'Failed to submit grade')
        } finally {
            setSubmitting(false)
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

    const getStatusBadge = (status: string) => {
        if (status === 'graded') {
            return <span className="inline-flex rounded-full px-2 text-xs font-semibold bg-green-100 text-green-800">Graded</span>
        }
        return <span className="inline-flex rounded-full px-2 text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
    }

    if (!assignment) return null

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Submissions</DialogTitle>
                        <DialogDescription>
                            View and grade student submissions for "{assignment.title}"
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">No submissions yet</p>
                                <p className="text-sm text-gray-500 mt-1">Students haven't submitted their work</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="text-gray-700 font-semibold">Student</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">Submitted At</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">File</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                                            <TableHead className="text-gray-700 font-semibold">Score</TableHead>
                                            <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission) => (
                                            <TableRow key={submission.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-gray-900">
                                                    {submission.student_name || `Student ${submission.student_id}`}
                                                </TableCell>
                                                <TableCell className="text-gray-600 text-sm">
                                                    {formatDate(submission.submitted_at)}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {submission.file_url ? (
                                                        <a
                                                            href={submission.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                        >
                                                            View File
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No file</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                                <TableCell className="text-gray-600">
                                                    {submission.score !== undefined ? `${submission.score}/${assignment.max_score}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleGrade(submission)}
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    >
                                                        {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Grade Submission Dialog */}
            <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                        <DialogDescription>
                            Provide grade and feedback for {gradingSubmission?.student_name || `Student ${gradingSubmission?.student_id}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Score (Max: {assignment.max_score})
                            </label>
                            <Input
                                type="number"
                                min="0"
                                max={assignment.max_score}
                                value={gradeValue}
                                onChange={(e) => setGradeValue(e.target.value)}
                                placeholder={`0 - ${assignment.max_score}`}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Feedback (Optional)
                            </label>
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide feedback for the student..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGradingSubmission(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitGrade} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit Grade
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
