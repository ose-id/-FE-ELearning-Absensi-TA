
'use client'

import Table from '@/components/ui/table'
import TableBody from '@/components/ui/table/table-body'
import TableCell from '@/components/ui/table/table-cell'
import TableHead from '@/components/ui/table/table-head'
import TableHeader from '@/components/ui/table/table-header'
import TableRow from '@/components/ui/table/table-row'
import Button from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { User } from '@/types/user'

interface UserListProps {
    users: User[]
    onEdit: (user: User) => void
    onDelete: (user: User) => void
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
    if (users.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-gray-500">
                No users found.
            </div>
        )
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN':
            case 'ADM':
            case 'GURU':
            case 'TEACHER':
            case 'TCR':
                return 'bg-blue-100 text-blue-800'
            case 'STUDENT':
            case 'MURID':
            case 'STD':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="rounded-md border">
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-700 font-bold">Full Name</TableHead>
                        <TableHead className="text-gray-700 font-bold">Username</TableHead>
                        <TableHead className="text-gray-700 font-bold">Email</TableHead>
                        <TableHead className="text-gray-700 font-bold">Role</TableHead>
                        <TableHead className="text-right text-gray-700 font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{user.fullname}</TableCell>
                            <TableCell className="text-gray-600">{user.username}</TableCell>
                            <TableCell className="text-gray-600">{user.email}</TableCell>
                            <TableCell>
                                <span
                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleBadgeColor(
                                        user.role_name || user.role_code
                                    )}`}
                                >
                                    {user.role_name}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(user)}
                                        className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(user)}
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
