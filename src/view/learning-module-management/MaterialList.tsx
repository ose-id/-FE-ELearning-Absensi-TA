'use client'

import { Edit, Trash2, FileText, Download, Eye } from 'lucide-react'
import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { Material } from '@/types/material'

interface MaterialListProps {
    materials: Material[]
    onEdit: (material: Material) => void
    onDelete: (material: Material) => void
    onView?: (material: Material) => void
    isEditable?: boolean
}

export default function MaterialList({
    materials,
    onEdit,
    onDelete,
    onView,
    isEditable = true
}: MaterialListProps) {
    const getFileTypeIcon = (fileType?: string) => {
        if (!fileType) return <FileText className="h-5 w-5 text-gray-400" />
        const type = fileType.toLowerCase()
        if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
        if (type.includes('doc') || type.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />
        if (type.includes('xls') || type.includes('excel')) return <FileText className="h-5 w-5 text-green-500" />
        if (type.includes('ppt') || type.includes('powerpoint')) return <FileText className="h-5 w-5 text-orange-500" />
        if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('image')) return <FileText className="h-5 w-5 text-purple-500" />
        return <FileText className="h-5 w-5 text-gray-400" />
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '-'
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (materials.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No materials available for this module</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-600 font-semibold">Title</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Description</TableHead>
                    <TableHead className="text-gray-600 font-semibold">File</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Date</TableHead>
                    {isEditable && <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {materials.map((material) => (
                    <TableRow key={material.nid} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                            <div className="flex items-center gap-3">
                                {getFileTypeIcon(material.vfile_type)}
                                <span>{material.vtitle}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-xs truncate">
                            {material.vdescription || '-'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {material.vfile_name ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{material.vfile_name}</span>
                                    <span className="text-xs text-gray-400">({formatFileSize(material.nfile_size)})</span>
                                </div>
                            ) : '-'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {material.dcrea ? new Date(material.dcrea).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        {isEditable && (
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {material.vfile_path && (
                                        <a
                                            href={material.vfile_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View/Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => onEdit(material)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(material)}
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
