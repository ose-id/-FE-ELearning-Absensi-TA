import { Shield, Users, Lock } from 'lucide-react'
import Button from '../button'

export interface GridItem {
    id: number | string
    fullname: string
    username: string
    email: string
    role_name?: string
    role_code?: string
}

export interface UserGridViewProps<T extends GridItem> {
    items: T[]
    onEdit: (item: T) => void
    onDelete: (item: T) => void
    emptyMessage?: string
    emptyDescription?: string
    className?: string
}

export default function UserGridView<T extends GridItem>({
    items,
    onEdit,
    onDelete,
    emptyMessage = 'No items found',
    emptyDescription = 'Try adjusting your search or filters',
    className = ''
}: UserGridViewProps<T>) {
    // Helper functions
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
            'bg-gradient-to-br from-blue-500 to-blue-600',
            'bg-gradient-to-br from-purple-500 to-purple-600',
            'bg-gradient-to-br from-pink-500 to-pink-600',
            'bg-gradient-to-br from-indigo-500 to-indigo-600',
            'bg-gradient-to-br from-green-500 to-green-600',
            'bg-gradient-to-br from-yellow-500 to-yellow-600',
            'bg-gradient-to-br from-red-500 to-red-600',
            'bg-gradient-to-br from-teal-500 to-teal-600',
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    const getRoleBadgeColor = (role: string) => {
        const roleUpper = role?.toUpperCase() || ''
        if (['ADMIN', 'ADM'].includes(roleUpper)) {
            return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
        }
        if (['TEACHER', 'GURU', 'TCR'].includes(roleUpper)) {
            return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        }
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
    }

    const getRoleIcon = (role: string) => {
        const roleUpper = role?.toUpperCase() || ''
        if (['ADMIN', 'ADM'].includes(roleUpper)) {
            return <Lock className="h-3 w-3" />
        }
        if (['TEACHER', 'GURU', 'TCR'].includes(roleUpper)) {
            return <Shield className="h-3 w-3" />
        }
        if (['STUDENT', 'STD', 'MR'].includes(roleUpper)) {
            return <Users className="h-3 w-3" />
        }
        return <Shield className="h-3 w-3" />
    }

    if (items.length === 0) {
        return (
            <div className={`col-span-full flex flex-col items-center justify-center rounded-xl bg-white p-12 shadow-sm ${className}`}>
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
                <p className="text-gray-600 text-center">{emptyDescription}</p>
            </div>
        )
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {items.map((item) => (
                <div
                    key={(item as any)._uid ?? `${(item as any).role_nid ?? 0}:${(item as any).id}`}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        {/* Avatar */}
                        <div
                            className={`flex h-20 w-20 items-center justify-center rounded-full ${getAvatarColor(
                                item.fullname
                            )} text-white font-bold text-2xl shadow-lg`}
                        >
                            {getInitials(item.fullname)}
                        </div>

                        {/* User Info */}
                        <div className="space-y-2 w-full">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {item.fullname}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">@{item.username}</p>
                            <p className="text-sm text-gray-600 truncate">{item.email}</p>
                        </div>

                        {/* Role Badge */}
                        {(item.role_name || item.role_code) && (
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm ${getRoleBadgeColor(
                                    item.role_name || item.role_code || ''
                                )}`}
                            >
                                {getRoleIcon(item.role_name || item.role_code || '')}
                                {item.role_name || item.role_code}
                            </span>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 w-full pt-2">
                            <Button
                                onClick={() => onEdit(item)}
                                variant="outline"
                                className="flex-1"
                            >
                                Edit
                            </Button>
                            <Button
                                onClick={() => onDelete(item)}
                                variant="destructive"
                                className="flex-1"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
