'use client'

import { Edit, Trash2, BookOpen } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { LearningModule } from '@/types/learning-module'
import { Class } from '@/types/class'
import { Subject } from '@/types/subject'
import { LOVItem } from '@/services/lov.service'

interface LearningModuleListProps {
    modules: LearningModule[]
    onEdit: (module: LearningModule) => void
    onDelete: (module: LearningModule) => void
    onSelect?: (module: LearningModule) => void
    selectedModuleId?: number
    classes?: Class[]
    subjects?: Subject[]
    academicYears?: LOVItem[]
    schoolTerms?: LOVItem[]
    isEditable?: boolean
}

export default function LearningModuleList({
    modules,
    onEdit,
    onDelete,
    onSelect,
    selectedModuleId,
    classes = [],
    subjects = [],
    academicYears = [],
    schoolTerms = [],
    isEditable = true
}: LearningModuleListProps) {
    const getAcademicYear = (module: LearningModule) => {
        // Try nested object (both PascalCase and camelCase from API)
        const ay = module.AcademicYear || module.academicYear
        if (ay?.vyear) return ay.vyear
        if (ay?.vacademic_year_name) return ay.vacademic_year_name
        // Try flat fields
        if (module.academic_year) return module.academic_year
        if (module.vacademic_year) return module.vacademic_year
        // Resolve from LOV by ID (API returns nid_academic_year)
        const ayId = module.nid_academic_year || module.academic_year_id
        if (ayId) {
            const found = academicYears.find(y => y.nid === ayId)
            if (found) return found.label
        }
        return '-'
    }

    const getSchoolTerm = (module: LearningModule) => {
        // Try nested object (both PascalCase and camelCase from API)
        const st = module.SchoolTerm || module.schoolTerm
        if (st?.vname) return st.vname
        if (st?.vterm_name) return st.vterm_name
        // Try flat field
        if (module.term) return module.term
        // Resolve from LOV by ID (API returns nid_school_term)
        const stId = module.nid_school_term || module.school_term_id
        if (stId) {
            const found = schoolTerms.find(t => t.nid === stId)
            if (found) return found.label
        }
        return '-'
    }

    const getSubjectName = (module: LearningModule) => {
        const subj = module.Subject || module.subject
        if (subj?.vsubject_name) return subj.vsubject_name
        const found = subjects.find(s => s.nid === module.nid_subject)
        return found?.vsubject_name || `Mapel ${module.nid_subject}`
    }

    const getClassName = (module: LearningModule) => {
        const cls = module.Class || module.class
        if (cls?.vname) return cls.vname
        const found = classes.find(c => c.nid === module.nid_class)
        return found?.vname || `Kelas ${module.nid_class}`
    }

    if (modules.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Materi tidak ditemukan</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-600 font-semibold">Nama Materi</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Kelas</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Mata Pelajaran</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Tahun Ajaran</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    {isEditable && <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {modules.map((module) => (
                    <TableRow
                        key={module.nid}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${selectedModuleId === module.nid ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                        onClick={() => onSelect?.(module)}
                    >
                        <TableCell className="font-medium text-gray-900">{module.vname}</TableCell>
                        <TableCell className="text-gray-600">
                            {getClassName(module)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {getSubjectName(module)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {(() => {
                                const year = getAcademicYear(module)
                                const term = getSchoolTerm(module)
                                if (year === '#' && term === '#') return '#'
                                if (year === '#') return term
                                if (term === '#') return year
                                return `${year} - ${term}`
                            })()}
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${module.nstatus === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {module.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </TableCell>
                        {isEditable && (
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(module) }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(module) }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
