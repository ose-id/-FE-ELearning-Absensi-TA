'use client'

import { Edit, Trash2, ClipboardList, Clock, CheckCircle, XCircle, Eye, FileQuestion } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { Quiz } from '@/types/quiz'

interface QuizListProps {
    quizzes: Quiz[]
    onEdit: (quiz: Quiz) => void
    onDelete: (quiz: Quiz) => void
    onViewQuestions?: (quiz: Quiz) => void
    isEditable?: boolean
}

export default function QuizList({
    quizzes,
    onEdit,
    onDelete,
    onViewQuestions,
    isEditable = true
}: QuizListProps) {
    const getStatusBadge = (status: number) => {
        if (status === 1) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3" />
                    Active
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <XCircle className="h-3 w-3" />
                Draft
            </span>
        )
    }

    const formatDate = (date?: string) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (quizzes.length === 0) {
        return (
            <div className="text-center py-12">
                <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No quizzes available for this module</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-600 font-semibold">Quiz Title</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Description</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Duration</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Max Score</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Date</TableHead>
                    {isEditable && <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {quizzes.map((quiz) => (
                    <TableRow key={quiz.nid} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="h-5 w-5 text-purple-500" />
                                <span>{quiz.vtitle}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-xs truncate">
                            {quiz.vdesc || '-'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {quiz.nduration} minutes
                            </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {quiz.nmax_score}
                        </TableCell>
                        <TableCell>
                            {getStatusBadge(quiz.nstatus)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {formatDate(quiz.dcrea)}
                        </TableCell>
                        {isEditable && (
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {onViewQuestions && (
                                        <button
                                            onClick={() => onViewQuestions(quiz)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Manage Questions"
                                        >
                                            <FileQuestion className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEdit(quiz)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(quiz)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
