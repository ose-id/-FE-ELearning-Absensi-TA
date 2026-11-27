'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import { Edit, Trash2, User as UserIcon } from 'lucide-react'
import { User } from '@/types/user'

interface UserListProps {
    users: User[]
    onEdit: (user: User) => void
    onDelete: (user: User) => void
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
    if (users.length === 0) {
        return (
            <div className="text-center py-12">
                <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
            </div>
        )
    }

    const getRoleBadgeColor = (role: string | number) => {
        const roleUpper = typeof role === 'string' ? role?.toUpperCase() : ''
        const roleNum = typeof role === 'number' ? role : null

        if (['ADMIN', 'ADM'].includes(roleUpper)) return 'bg-purple-100 text-purple-800'
        if (['TEACHER', 'GURU', 'GR'].includes(roleUpper)) return 'bg-blue-100 text-blue-800'
        if (['STUDENT', 'MURID', 'MR', 'STD'].includes(roleUpper)) return 'bg-green-100 text-green-800'

        if (roleNum === 1) return 'bg-purple-100 text-purple-800'
        if (roleNum === 2) return 'bg-blue-100 text-blue-800'
        if (roleNum === 3) return 'bg-green-100 text-green-800'

        return 'bg-gray-100 text-gray-800'
    }

    const getRoleDisplayName = (user: User) => {
        if (user.vrole_name) return user.vrole_name
        if (user.role_name) return user.role_name
        if (user.role_nid === 1) return 'Admin'
        if (user.role_nid === 2) return 'Teacher'
        if (user.role_nid === 3) return 'Student'
        return 'Unknown'
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-600 font-semibold">User</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Email</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Role</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Created At</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Updated At</TableHead>
                    <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={(user as any)._uid ?? `${user.role_nid ?? 0}:${user.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                    <UserIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {user.fullname}
                                        {user.degree && (
                                            <span className="ml-1 text-xs font-normal text-gray-500">
                                                , {user.degree}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {user.email}
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                user.vrole_name || user.vrole_code || user.role_nid || ''
                            )}`}>
                                {getRoleDisplayName(user)}
                            </span>
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {(user.created_at || user.dcrea) ? new Date(user.created_at || user.dcrea!).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                            {(user.updated_at || user.dmodi) ? new Date(user.updated_at || user.dmodi!).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(user)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
