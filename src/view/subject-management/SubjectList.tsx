'use client'

import { Edit, Trash2, BookMarked } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Subject } from '@/types/subject'
import { Department } from '@/types/department'

interface SubjectListProps {
    subjects: Subject[]
    departments?: Department[]
    onEdit: (subject: Subject) => void
    onDelete: (subject: Subject) => void
}

export default function SubjectList({ subjects, departments = [], onEdit, onDelete }: SubjectListProps) {
    const getDepartmentName = (subject: Subject): string => {
        if (subject.Department?.vdepartment_name) return subject.Department.vdepartment_name
        const dept = departments.find(d => d.nid === subject.nid_department)
        return dept?.vdepartment_name || `Dept ID: ${subject.nid_department}`
    }
    if (subjects.length === 0) {
        return (
            <div className="text-center py-12">
                <BookMarked className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No subjects found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold">ID</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Subject Name</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Department</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                        <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subjects.map((subject) => (
                        <TableRow key={subject.nid} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">{subject.nid}</TableCell>
                            <TableCell className="text-gray-900 font-medium">{subject.vsubject_name}</TableCell>
                            <TableCell className="text-gray-600">
                                {getDepartmentName(subject)}
                            </TableCell>
                            <TableCell>
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${subject.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {subject.nstatus === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(subject)}
                                        className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(subject)}
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
