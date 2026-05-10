'use client'

import { Edit, Trash2, BookOpen } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { Class } from '@/types/class'

interface ClassListProps {
    classes: Class[]
    departments?: any[]
    academicYears?: any[]
    schoolTerms?: any[]
    onEdit: (cls: Class) => void
    onDelete: (cls: Class) => void
    viewMode?: 'list' | 'grid'
    isEditable?: boolean
}

ClassList.defaultProps = {
    isEditable: true,
}

export default function ClassList({ classes, departments = [], academicYears = [], schoolTerms = [], onEdit, onDelete, viewMode = 'list', isEditable = true }: ClassListProps) {
    const getDepartmentName = (cls: Class): string => {
        if (cls.Department?.vdepartment_name) return cls.Department.vdepartment_name
        const dept = departments.find((d: any) => d.nid === cls.nid_department)
        return dept?.label || dept?.vdepartment_name || `Dept ${cls.nid_department}`
    }

    const getAcademicYear = (cls: Class): string => {
        if (cls.academic_year) return cls.academic_year;
        const acdId = cls.academic_year_id || (cls as any).academicYearId || (cls as any).nid_academic_year;
        const yr = academicYears.find((y: any) => y.nid === acdId);
        return yr?.label || (cls as any).AcademicYear?.vacademic_year_name || '-'
    }

    const getSchoolTerm = (cls: Class): string => {
        if (cls.school_term) return cls.school_term;
        const termId = cls.school_term_id || (cls as any).schoolTermId || (cls as any).nid_school_term;
        const tm = schoolTerms.find((t: any) => t.nid === termId);
        return tm?.label || (cls as any).SchoolTerm?.vterm_name || '-'
    }

    if (classes.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No classes found</p>
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
                                    <button
                                        onClick={() => onEdit(cls)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(cls)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
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

                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                    {getAcademicYear(cls)} - {getSchoolTerm(cls)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // List view (table)
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-600 font-semibold">Class Name</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Department</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Academic Year</TableHead>
                    <TableHead className="text-gray-600 font-semibold">School Term</TableHead>
                    <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {classes.map((cls) => (
                    <TableRow key={cls.nid} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                            {cls.vname}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {getDepartmentName(cls)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {getAcademicYear(cls)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {getSchoolTerm(cls)}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                {isEditable && (
                                    <>
                                        <button
                                            onClick={() => onEdit(cls)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(cls)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}