
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Shield, ShieldCheck, Lock, Code, X } from 'lucide-react'
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

        const roleId = role.id ?? role.nid
        if (!roleId) return

        try {
            await roleService.deleteRole(roleId, session.accessToken)
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
                const roleId = selectedRole.id ?? selectedRole.nid
                if (!roleId) {
                    toast.error('Invalid role ID')
                    return
                }
                await roleService.updateRole(
                    roleId,
                    {
                        nid: roleId,
                        vrole_name: data.role_name,
                        vrole_code: data.role_code
                    },
                    session.accessToken
                )
                toast.success('Role updated successfully')
            } else {
                // Create
                await roleService.createRole(
                    {
                        vrole_name: data.role_name,
                        vrole_code: data.role_code
                    },
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

    // Stats Calculation
    const totalRoles = roles.length
    // Assuming standard roles are Admin, Teacher, Student
    const systemRoleCount = roles.filter(r => ['admin', 'adm', 'teacher', 'tcr', 'student', 'std'].includes(r.role_code?.toLowerCase() || '')).length
    const customRoleCount = Math.max(0, totalRoles - systemRoleCount)

    const stats = [
        {
            label: 'Total Roles',
            value: totalRoles,
            icon: Shield,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            label: 'System Roles',
            value: systemRoleCount,
            icon: Lock,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Custom Roles',
            value: customRoleCount,
            icon: Code,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            label: 'Active Roles',
            value: totalRoles, // Assuming all displayed are active for now
            icon: ShieldCheck,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                        Role Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage system roles and access permissions for the application.
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                </Button>
            </div>

            {/* Statistics Section */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            {stat.label}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Search and Content Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all max-w-md">
                    <Search className="h-5 w-5 text-gray-400" />
                    <Input
                        className="border-none text-black bg-transparent focus-visible:ring-0 p-0"
                        placeholder="Search roles by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <RoleList
                        roles={filteredRoles}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

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
