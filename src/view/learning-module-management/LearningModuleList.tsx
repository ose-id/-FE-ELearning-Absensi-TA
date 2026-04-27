'use client'

import { Edit, Trash2, BookOpen, Users, GraduationCap } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { LearningModule } from '@/types/learning-module'

interface LearningModuleListProps {
    modules: LearningModule[]
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
        return cls?.vname || `Class ${module.nid_class}`
    }

    const getSubjectName = (module: LearningModule) => {
        if (module.Subject?.vsubject_name) return module.Subject.vsubject_name
        const subj = subjects.find(s => s.nid === module.nid_subject)
        return subj?.vsubject_name || `Subject ${module.nid_subject}`
    }

    if (modules.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No learning modules found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold">Module Name</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Class</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Subject</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Academic Year</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                        {isEditable && <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {modules.map((module) => (
                        <TableRow key={module.nid} className="hover:bg-gray-50 transition-colors">
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
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${module.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {module.nstatus === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            {isEditable && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(module)}
                                            className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(module)}
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
