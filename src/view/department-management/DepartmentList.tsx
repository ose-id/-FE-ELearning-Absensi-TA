'use client'

import { Edit, Trash2, Building2 } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
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
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No departments found</p>
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
                        <TableHead className="text-gray-700 font-semibold">Department Name</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                        <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {departments.map((dept) => (
                        <TableRow key={dept.nid} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">{dept.nid}</TableCell>
                            <TableCell className="text-gray-900 font-medium">{dept.vdepartment_name}</TableCell>
                            <TableCell>
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${dept.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {dept.nstatus === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            <TableCell className="text-gray-600">
                                {dept.dcrea ? new Date(dept.dcrea).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(dept)}
                                        className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(dept)}
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
