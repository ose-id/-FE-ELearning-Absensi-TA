
'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { Role } from '@/types/role'

interface RoleListProps {
    roles: Role[]
    onEdit: (role: Role) => void
    onDelete: (role: Role) => void
}

export default function RoleList({ roles, onEdit, onDelete }: RoleListProps) {
    if (roles.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-gray-500">
                No roles found.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-700 font-bold">ID</TableHead>
                        <TableHead className="text-gray-700 font-bold">Role Name</TableHead>
                        <TableHead className="text-gray-700 font-bold">Role Code</TableHead>
                        <TableHead className="text-right text-gray-700 font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id} className="hover:bg-gray-50">
                            <TableCell className="text-gray-600">{role.id}</TableCell>
                            <TableCell className="font-medium text-gray-900">{role.role_name}</TableCell>
                            <TableCell>
                                <code className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-800 border border-gray-200">
                                    {role.role_code}
                                </code>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(role)}
                                        className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(role)}
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
