'use client'

import { Edit, Trash2, Building2 } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { Department } from '@/types/department'

interface DepartmentListProps {
    departments: Department[]
    onEdit: (dept: Department) => void
    onDelete: (dept: Department) => void
}

export default function DepartmentList({ departments, onEdit, onDelete }: DepartmentListProps) {
    if (departments.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No departments found</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-600 font-semibold">ID</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Department Name</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Created</TableHead>
                    <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {departments.map((dept) => (
                    <TableRow key={dept.nid} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{dept.nid}</TableCell>
                        <TableCell className="text-gray-900">{dept.vdepartment_name}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${dept.nstatus === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {dept.nstatus === 1 ? 'Active' : 'Inactive'}
                            </span>
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {dept.dcrea ? new Date(dept.dcrea).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(dept)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(dept)}
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
