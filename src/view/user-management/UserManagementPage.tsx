
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react' // Added Loader2
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { userService } from '@/services/user.service'
import { User } from '@/types/user'
import UserList from './UserList'
import UserForm, { UserFormData } from './UserForm'

export default function UserManagementPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchUsers = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await userService.getUsers(session.accessToken)
            if (response && response.data) {
                setUsers(response.data)
            }
        } catch (error: any) {
            console.error('Failed to fetch users:', error)
            toast.error(error.message || 'Failed to list users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [session])

    const handleCreate = () => {
        setSelectedUser(null)
        setIsFormOpen(true)
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setIsFormOpen(true)
    }

    const handleDelete = async (user: User) => {
        if (!confirm(`Are you sure you want to delete ${user.fullname}?`)) return

        if (!session?.accessToken) return

        try {
            await userService.deleteUser(user.id, session.accessToken)
            toast.success('User deleted successfully')
            fetchUsers()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user')
        }
    }

    const handleFormSubmit = async (data: UserFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedUser) {
                // Update
                await userService.updateUser(
                    selectedUser.id,
                    {
                        id: selectedUser.id,
                        ...data,
                        // If password is empty string, make it undefined so we don't send it or handle in service
                        password: data.password || undefined
                    },
                    session.accessToken
                )
                toast.success('User updated successfully')
            } else {
                // Create
                if (!data.password) {
                    toast.error('Password is required for new users')
                    setIsSubmitting(false)
                    return
                }
                await userService.createUser(
                    {
                        ...data,
                        password: data.password
                    },
                    session.accessToken
                )
                toast.success('User created successfully')
            }

            setIsFormOpen(false)
            fetchUsers()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save user')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return true

        const name = user.fullname?.toLowerCase() || ''
        const email = user.email?.toLowerCase() || ''
        const username = user.username?.toLowerCase() || ''

        return name.includes(term) || email.includes(term) || username.includes(term)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500">
                        Manage system users and their roles
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                    className="border-none text-black bg-transparent focus-visible:ring-0"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <UserList
                    users={filteredUsers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <UserForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                initialData={selectedUser}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
