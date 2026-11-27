'use client'

import { Target, Edit, Trash2 } from 'lucide-react'
import { SchoolTerm } from '@/services/school-term.service'

interface SchoolTermListProps {
    schoolTerms: SchoolTerm[]
    academicYears?: any[]
    onEdit: (term: SchoolTerm) => void
    onDelete: (term: SchoolTerm) => void
}

export default function SchoolTermList({ schoolTerms, academicYears = [], onEdit, onDelete }: SchoolTermListProps) {
    const getAcademicYear = (term: SchoolTerm): string => {
        const acdId = (term as any).academic_year_id || (term as any).academicYearId || (term as any).nid_academic_year;
        const yr = academicYears.find((y: any) => y.nid === acdId);
        return yr?.vacademic_year_name || yr?.label || term.AcademicYear?.vacademic_year_name || '-'
    }

    if (schoolTerms.length === 0) {
        return (
            <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No school terms found</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">School Term</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Academic Year</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {schoolTerms.map((term) => (
                        <tr key={term.nid} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                        <Target className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-900">{term.vterm_name}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                                {getAcademicYear(term)}
                            </td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    term.nstatus === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {term.nstatus === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(term)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(term)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}