'use client'

import { Edit, Trash2, BookOpen, Users, GraduationCap } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { LearningModule } from '@/types/learning-module'
import { Class } from '@/types/class'
import { Subject } from '@/types/subject'

interface LearningModuleListProps {
    modules: LearningModule[]
    onEdit: (module: LearningModule) => void
    onDelete: (module: LearningModule) => void
    classes?: Class[]
    subjects?: Subject[]
    isEditable?: boolean
}

export default function LearningModuleList({
    modules,
    onEdit,
    onDelete,
    classes = [],
    subjects = [],
    isEditable = true
}: LearningModuleListProps) {
    const getClassName = (module: LearningModule) => {
        if (module.Class?.vname) return module.Class.vname
        const cls = classes.find(c => c.nid === module.nid_class)
        return cls?.vname || `Kelas ${module.nid_class}`
    }

    const getSubjectName = (module: LearningModule) => {
        if (module.Subject?.vsubject_name) return module.Subject.vsubject_name
        const subj = subjects.find(s => s.nid === module.nid_subject)
        return subj?.vsubject_name || `Mapel ${module.nid_subject}`
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
                    <TableRow key={module.nid} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{module.vname}</TableCell>
                        <TableCell className="text-gray-600">
                            {getClassName(module)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {getSubjectName(module)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {module.academic_year || module.vacademic_year || '-'}
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
                                        onClick={() => onEdit(module)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(module)}
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
