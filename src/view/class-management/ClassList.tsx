'use client'

import { Edit, Trash2, BookOpen, Users } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Class } from '@/types/class'
import { Department } from '@/types/department'

interface ClassListProps {
    classes: Class[]
    departments?: Department[]
    onEdit: (cls: Class) => void
    onDelete: (cls: Class) => void
    viewMode?: 'list' | 'grid'
    isEditable?: boolean
}

ClassList.defaultProps = {
    isEditable: true,
};

export default function ClassList({ classes, departments = [], onEdit, onDelete, viewMode = 'list', isEditable = true }: ClassListProps) {
    const getDepartmentName = (cls: Class): string => {
        if (cls.Department?.vdepartment_name) return cls.Department.vdepartment_name
        const dept = departments.find(d => d.nid === cls.nid_department)
        return dept?.vdepartment_name || `Dept ${cls.nid_department}`
    }
    if (classes.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No classes found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
        )
    }

    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <div
                        key={cls.nid}
                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

                        <div className="flex items-start justify-between mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            {isEditable && (
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(cls)}
                                        className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(cls)}
                                        className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                    {cls.vname}
                                </h3>
                                <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                    {getDepartmentName(cls)}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                                {cls.vdesc || 'No description available'}
                            </p>

                            {cls.term && (
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">Term: {cls.term}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // List view (table)
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold">Class Name</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Department</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Description</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Term</TableHead>
                        {isEditable && <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.map((cls) => (
                        <TableRow key={cls.nid} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">{cls.vname}</TableCell>
                            <TableCell className="text-gray-600">
                                {getDepartmentName(cls)}
                            </TableCell>
                            <TableCell className="text-gray-600 max-w-xs truncate">
                                {cls.vdesc || '-'}
                            </TableCell>
                            <TableCell className="text-gray-600">
                                {cls.term || '-'}
                            </TableCell>
                            {isEditable && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(cls)}
                                            className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(cls)}
                                            className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
