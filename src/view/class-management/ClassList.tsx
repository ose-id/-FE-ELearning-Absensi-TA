
'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { Class } from '@/types/class'

interface ClassListProps {
    classes: Class[]
    onEdit: (cls: Class) => void
    onDelete: (cls: Class) => void
}

export default function ClassList({ classes, onEdit, onDelete }: ClassListProps) {
    if (classes.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-gray-500">
                No classes found.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-700 font-bold">Class Name</TableHead>
                        <TableHead className="text-gray-700 font-bold">Code</TableHead>
                        <TableHead className="text-gray-700 font-bold">Description</TableHead>
                        <TableHead className="text-gray-700 font-bold">Teacher</TableHead>
                        <TableHead className="text-right text-gray-700 font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.map((cls) => (
                        <TableRow key={cls.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{cls.name}</TableCell>
                            <TableCell className="text-gray-600">{cls.code}</TableCell>
                            <TableCell className="text-gray-600">{cls.description}</TableCell>
                            <TableCell className="text-gray-600">
                                {cls.teacher_name || cls.teacher_id}
                            </TableCell>
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
