
'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Edit, Trash2, Users } from 'lucide-react'
import { Assignment } from '@/types/assignment'

interface AssignmentListProps {
    assignments: Assignment[]
    onEdit: (assignment: Assignment) => void
    onDelete: (assignment: Assignment) => void
    onViewSubmissions: (assignment: Assignment) => void
}

export default function AssignmentList({ assignments, onEdit, onDelete, onViewSubmissions }: AssignmentListProps) {
    if (assignments.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-gray-500">
                No assignments found.
            </div>
        )
    }

    const getStatusBadge = (dueDate: string) => {
        const due = new Date(dueDate)
        const now = new Date()
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
            return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-red-100 text-red-800">Overdue</span>
        } else if (diffDays <= 3) {
            return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-yellow-100 text-yellow-800">Due Soon</span>
        } else {
            return <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800">Upcoming</span>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="rounded-md border">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-700 font-bold">Title</TableHead>
                        <TableHead className="text-gray-700 font-bold">Class</TableHead>
                        <TableHead className="text-gray-700 font-bold">Due Date</TableHead>
                        <TableHead className="text-gray-700 font-bold">Max Score</TableHead>
                        <TableHead className="text-gray-700 font-bold">Status</TableHead>
                        <TableHead className="text-right text-gray-700 font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignments.map((assignment) => (
                        <TableRow key={assignment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">
                                <div>
                                    <div className="font-semibold">{assignment.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{assignment.description}</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-600">{assignment.class_name || `Class ${assignment.class_id}`}</TableCell>
                            <TableCell className="text-gray-600">{formatDate(assignment.due_date)}</TableCell>
                            <TableCell className="text-gray-600">{assignment.max_score}</TableCell>
                            <TableCell>{getStatusBadge(assignment.due_date)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onViewSubmissions(assignment)}
                                        className="h-8 w-8 text-purple-600 hover:text-purple-900 hover:bg-purple-50"
                                        title="View Submissions"
                                    >
                                        <Users className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(assignment)}
                                        className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(assignment)}
                                        className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
