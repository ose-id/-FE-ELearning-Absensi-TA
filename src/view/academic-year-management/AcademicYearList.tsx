'use client'

import { Calendar, Edit, Trash2 } from 'lucide-react'
import { AcademicYear } from '@/services/academic-year.service'

interface AcademicYearListProps {
    academicYears: AcademicYear[]
    onEdit: (year: AcademicYear) => void
    onDelete: (year: AcademicYear) => void
}

export default function AcademicYearList({ academicYears, onEdit, onDelete }: AcademicYearListProps) {
    if (academicYears.length === 0) {
        return (
            <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No academic years found</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Academic Year</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Start Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">End Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {academicYears.map((year) => (
                        <tr key={year.nid} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-900">{year.vacademic_year_name}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                                {year.dstart_date ? new Date(year.dstart_date).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                                {year.dend_date ? new Date(year.dend_date).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    year.nstatus === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {year.nstatus === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(year)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(year)}
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