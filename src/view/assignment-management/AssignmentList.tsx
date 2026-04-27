'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import CardContent from '@/components/ui/card/card-content'
import { Edit, Trash2, Users, FileText } from 'lucide-react'
import { Assignment } from '@/types/assignment'
import { Class } from '@/types/class'
import { LearningModule } from '@/types/learning-module'

    isEditable?: boolean
    isTeacher?: boolean
    classes?: Class[]
    learningModules?: LearningModule[]
}

export default function AssignmentList({
    assignments,
    onEdit,
    onDelete,
    onViewSubmissions,
    isEditable = true,
    isTeacher = false,
    classes = [],
    learningModules = []
}: AssignmentListProps) {
    const getClassName = (assignment: Assignment) => {
        if (assignment.class_name) return assignment.class_name
        const cls = classes.find(c => c.nid === assignment.class_id)
        return cls?.vname || `Class ${assignment.class_id}`
    }

    const getModuleName = (assignment: Assignment) => {
        if (assignment.learning_module_name) return assignment.learning_module_name
        const mod = learningModules.find(m => m.nid === assignment.learning_module_id)
        return mod?.vname || `Module ${assignment.learning_module_id}`
    }

    if (assignments.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No assignments found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
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
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold">Title</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Module</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Class</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Due Date</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Max Score</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                        {(isEditable || isTeacher) && (
                            <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignments.map((assignment) => (
                        <TableRow key={assignment.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">
                                <div>
                                    <div className="font-semibold">{assignment.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{assignment.description}</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                                {getModuleName(assignment)}
                            </TableCell>
                            <TableCell className="text-gray-600 border border-gray-100">{getClassName(assignment)}</TableCell>
                            <TableCell className="text-gray-600">{formatDate(assignment.due_date)}</TableCell>
                            <TableCell className="text-gray-600">{assignment.max_score}</TableCell>
                            <TableCell>{getStatusBadge(assignment.due_date)}</TableCell>
                            {(isEditable || isTeacher) && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {(isEditable || isTeacher) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onViewSubmissions(assignment)}
                                                className="h-8 w-8 text-purple-600 hover:text-purple-900 hover:bg-purple-50"
                                                title="View Submissions"
                                            >
                                                <Users className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {isEditable && (
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
