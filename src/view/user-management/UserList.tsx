
'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Edit, Trash2, Mail, User as UserIcon, Shield, Lock, Users } from 'lucide-react'
import { User } from '@/types/user'

interface UserListProps {
    users: User[]
    onEdit: (user: User) => void
    onDelete: (user: User) => void
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 mb-4">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
                <p className="text-sm text-gray-500">
                    Try adjusting your search or add a new user to get started.
                </p>
            </div>
        )
    }

    const getRoleBadgeColor = (role: string | number) => {
        const roleUpper = typeof role === 'string' ? role?.toUpperCase() : ''
        const roleNum = typeof role === 'number' ? role : null

        // Check by name
        if (['ADMIN', 'ADM'].includes(roleUpper)) return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
        if (['TEACHER', 'GURU', 'GR'].includes(roleUpper)) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        if (['STUDENT', 'MURID', 'MR', 'STD'].includes(roleUpper)) return 'bg-gradient-to-r from-green-500 to-green-600 text-white'

        // Check by role_nid
        if (roleNum === 1) return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
        if (roleNum === 2) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        if (roleNum === 3) return 'bg-gradient-to-r from-green-500 to-green-600 text-white'

        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-gradient-to-br from-pink-400 to-pink-600',
            'bg-gradient-to-br from-purple-400 to-purple-600',
            'bg-gradient-to-br from-blue-400 to-blue-600',
            'bg-gradient-to-br from-green-400 to-green-600',
            'bg-gradient-to-br from-yellow-400 to-yellow-600',
            'bg-gradient-to-br from-red-400 to-red-600',
            'bg-gradient-to-br from-indigo-400 to-indigo-600',
            'bg-gradient-to-br from-teal-400 to-teal-600',
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    const getRoleIcon = (role: string | number) => {
        const roleUpper = typeof role === 'string' ? role?.toUpperCase() : ''
        const roleNum = typeof role === 'number' ? role : null

        // Check by name
        if (['ADMIN', 'ADM'].includes(roleUpper)) return <Lock className="h-3 w-3" />
        if (['TEACHER', 'GURU', 'GR'].includes(roleUpper)) return <Shield className="h-3 w-3" />
        if (['STUDENT', 'MURID', 'MR', 'STD'].includes(roleUpper)) return <Users className="h-3 w-3" />

        // Check by role_nid
        if (roleNum === 1) return <Lock className="h-3 w-3" />
        if (roleNum === 2) return <Shield className="h-3 w-3" />
        if (roleNum === 3) return <Users className="h-3 w-3" />

        return <Shield className="h-3 w-3" />
    }

    const getRoleDisplayName = (user: User) => {
        if (user.vrole_name) return user.vrole_name
        if (user.role_name) return user.role_name
        // Fallback based on role_nid
        if (user.role_nid === 1) return 'Admin'
        if (user.role_nid === 2) return 'Guru'
        if (user.role_nid === 3) return 'Murid'
        return 'Unknown'
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <Table className="text-gray-900">
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <TableRow className="border-b border-gray-200">
                        <TableHead className="text-gray-700 font-bold py-4">User</TableHead>
                        <TableHead className="text-gray-700 font-bold">Contact</TableHead>
                        <TableHead className="text-gray-700 font-bold">Role</TableHead>
                        <TableHead className="text-right text-gray-700 font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow
                            key={(user as any)._uid ?? `${user.role_nid ?? 0}:${user.id}`}
                            className="group hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100 last:border-0"
                        >
                            <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getAvatarColor(user.fullname)} text-white font-semibold text-sm shadow-md`}>
                                        {getInitials(user.fullname)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {user.fullname}
                                            {user.degree && (
                                                <span className="ml-1 text-xs font-normal text-gray-500">
                                                    , {user.degree}
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <UserIcon className="h-3 w-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">@{user.username}</p>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-sm text-gray-600">{user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getRoleBadgeColor(
                                        user.vrole_name || user.vrole_code || user.role_nid || ''
                                    )}`}
                                >
                                    {getRoleIcon(user.vrole_name || user.vrole_code || user.role_nid || '')}
                                    {getRoleDisplayName(user)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(user)}
                                        title="Edit user"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(user)}
                                        title="Delete user"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
