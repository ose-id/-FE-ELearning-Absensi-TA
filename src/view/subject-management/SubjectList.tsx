'use client'

import { Edit, Trash2, BookMarked } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { Subject } from '@/types/subject'

interface SubjectListProps {
    subjects: Subject[]
    departments?: any[]
    onEdit: (subject: Subject) => void
    onDelete: (subject: Subject) => void
}

export default function SubjectList({ subjects, departments = [], onEdit, onDelete }: SubjectListProps) {
    const getDepartmentName = (subject: Subject): string => {
        if (subject.Department?.vdepartment_name) return subject.Department.vdepartment_name
        const dept = departments.find((d: any) => d.nid === subject.nid_department)
        return dept?.label || dept?.vdepartment_name || `Dept ID: ${subject.nid_department}`
    }
    if (subjects.length === 0) {
        return (
            <div className="text-center py-12">
                <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No subjects found</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-600 font-semibold">ID</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Subject Name</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Department</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subjects.map((subject) => (
                    <TableRow key={subject.nid} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{subject.nid}</TableCell>
                        <TableCell className="text-gray-900">{subject.vsubject_name}</TableCell>
                        <TableCell className="text-gray-600">
                            {getDepartmentName(subject)}
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject.nstatus === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {subject.nstatus === 1 ? 'Active' : 'Inactive'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(subject)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(subject)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
