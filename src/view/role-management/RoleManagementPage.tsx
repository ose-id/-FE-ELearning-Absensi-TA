
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { roleService } from '@/services/role.service'
import { Role } from '@/types/role'
import RoleList from './RoleList'
import RoleForm, { RoleFormData } from './RoleForm'

export default function RoleManagementPage() {
    const { data: session } = useSession()
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchRoles = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await roleService.getRoles(session.accessToken)
            if (response && response.data) {
                setRoles(response.data)
            }
        } catch (error: any) {
            console.error('Failed to fetch roles:', error)
            toast.error(error.message || 'Failed to list roles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [session])

    const handleCreate = () => {
        setSelectedRole(null)
        setIsFormOpen(true)
    }

    const handleEdit = (role: Role) => {
        setSelectedRole(role)
        setIsFormOpen(true)
    }

    const handleDelete = async (role: Role) => {
        if (!confirm(`Are you sure you want to delete role ${role.role_name}?`)) return

        if (!session?.accessToken) return

        try {
            await roleService.deleteRole(role.id, session.accessToken)
            toast.success('Role deleted successfully')
            fetchRoles()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete role')
        }
    }

    const handleFormSubmit = async (data: RoleFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedRole) {
                // Update
                await roleService.updateRole(
                    selectedRole.id,
                    {
                        id: selectedRole.id,
                        ...data
                    },
                    session.accessToken
                )
                toast.success('Role updated successfully')
            } else {
                // Create
                await roleService.createRole(
                    data,
                    session.accessToken
                )
                toast.success('Role created successfully')
            }

            setIsFormOpen(false)
            fetchRoles()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save role')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredRoles = roles.filter(role => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return true

        const name = role.role_name?.toLowerCase() || ''
        const code = role.role_code?.toLowerCase() || ''

        return name.includes(term) || code.includes(term)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                    <p className="text-sm text-gray-500">
                        Define system roles and access codes
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                </Button>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                    className="border-none bg-transparent focus-visible:ring-0"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <RoleList
                    roles={filteredRoles}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <RoleForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                initialData={selectedRole}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
