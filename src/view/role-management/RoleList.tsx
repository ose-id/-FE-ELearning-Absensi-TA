
'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Edit, Trash2, Shield, Lock, ShieldCheck, UserCog, Users } from 'lucide-react'
import { Role } from '@/types/role'

interface RoleListProps {
    roles: Role[]
    onEdit: (role: Role) => void
    onDelete: (role: Role) => void
}

export default function RoleList({ roles, onEdit, onDelete }: RoleListProps) {
    if (roles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 mb-4">
                    <Shield className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No roles found</h3>
                <p className="text-sm text-gray-500">
                    Try creating a new role to get started.
                </p>
            </div>
        )
    }

    const getRoleIcon = (code: string) => {
        const c = code?.toUpperCase() || ''
        if (['ADM', 'ADMIN'].includes(c)) return Lock
        if (['TCR', 'TEACHER', 'GURU', 'GR'].includes(c)) return Shield
        if (['STD', 'STUDENT', 'MURID', 'MR'].includes(c)) return Users
        return Shield
    }

    const getRoleBadgeColor = (code: string) => {
        const c = code?.toUpperCase() || ''
        if (['ADM', 'ADMIN'].includes(c)) return 'bg-purple-100 text-purple-700 border-purple-200'
        if (['TCR', 'TEACHER', 'GURU', 'GR'].includes(c)) return 'bg-blue-100 text-blue-700 border-blue-200'
        if (['STD', 'STUDENT', 'MURID', 'MR'].includes(c)) return 'bg-green-100 text-green-700 border-green-200'
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <Table className="text-gray-900">
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <TableRow className="border-b border-gray-200">
                        <TableHead className="text-gray-700 font-bold py-4 pl-6">Role Name</TableHead>
                        <TableHead className="text-gray-700 font-bold">Role Code</TableHead>
                        <TableHead className="text-gray-700 font-bold">ID</TableHead>
                        <TableHead className="text-right text-gray-700 font-bold pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((role) => {
                        const roleCode = role.vrole_code || role.role_code || ''
                        const Icon = getRoleIcon(roleCode)
                        return (
                            <TableRow key={role.id} className="group hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100 last:border-0">
                                <TableCell className="py-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm border border-slate-200 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{role.vrole_name || role.role_name}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getRoleBadgeColor(roleCode)}`}>
                                        {roleCode}
                                    </span>
                                </TableCell>
                                <TableCell className="text-gray-500 font-mono text-xs">
                                    #{role.id || role.nid}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(role)}
                                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                            title="Edit Role"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(role)}
                                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                            title="Delete Role"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
