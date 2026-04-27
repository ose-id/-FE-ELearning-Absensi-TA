
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Users, Shield, GraduationCap, UserCheck, Filter, X, LayoutGrid, List, Upload, Download } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import UserGridView from '@/components/ui/grid'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { userService } from '@/services/user.service'
import { roleService } from '@/services/role.service'
import { User } from '@/types/user'
import { Role } from '@/types/role'
import UserList from './UserList'
import UserForm, { UserFormData } from './UserForm'

type ViewMode = 'list' | 'grid'

export default function UserManagementPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('All Roles')
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(9)
    const [importing, setImporting] = useState(false)

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

    const fetchRoles = async () => {
        if (!session?.accessToken) return
        try {
            const response = await roleService.getRoles(session.accessToken)
            if (response && response.data) {
                setRoles(response.data)
            }
        } catch (error: any) {
            console.error('Failed to fetch roles:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchUsers()
            fetchRoles()
        }
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
            await userService.deleteUser(user.id, user.role_nid, session.accessToken)
            toast.success('User deleted successfully')
            fetchUsers()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user')
        }
    }

    // Export users to Excel
    const handleExport = () => {
        if (users.length === 0) {
            toast.warning('No users to export')
            return
        }

        const exportData = users.map(user => ({
            'Username': user.username || '',
            'Full Name': user.fullname || '',
            'Email': user.email || '',
            'Phone': user.phone || '',
            'WhatsApp': user.whatsapp || '',
            'Role': user.vrole_name || user.role_name || '',
            'Status': user.status || '',
            'Created At': user.created_at || '',
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Users')

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Username
            { wch: 25 }, // Full Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 15 }, // WhatsApp
            { wch: 12 }, // Role
            { wch: 10 }, // Status
            { wch: 20 }, // Created At
        ]

        XLSX.writeFile(wb, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success('Users exported successfully')
    }

    // Import users from Excel
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setImporting(true)
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[]

            if (jsonData.length === 0) {
                toast.warning('No data found in the file')
                return
            }

            // Map Excel columns to user data
            let successCount = 0
            let errorCount = 0

            for (const row of jsonData) {
                try {
                    const userData = {
                        username: row['Username'] || row['username'] || '',
                        email: row['Email'] || row['email'] || '',
                        fullname: row['Full Name'] || row['fullname'] || '',
                        phone: row['Phone'] || row['phone'] || '',
                        whatsapp: row['WhatsApp'] || row['whatsapp'] || '',
                        role: row['Role'] || row['role'] || 'Murid',
                        password: 'ChangeMe@123',
                        status: row['Status'] || row['status'] || 'active',
                    }

                    if (!userData.username || !userData.email || !userData.fullname) {
                        errorCount++
                        continue
                    }

                    await userService.createUser(userData, session!.accessToken)
                    successCount++
                } catch (e) {
                    errorCount++
                    console.error('Failed to import row:', row, e)
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} users`)
                fetchUsers()
            }
            if (errorCount > 0) {
                toast.warning(`Failed to import ${errorCount} rows`)
            }
        } catch (error: any) {
            console.error('Import error:', error)
            toast.error(error.message || 'Failed to import users')
        } finally {
            setImporting(false)
            event.target.value = '' // Reset input
        }
    }

    const handleFormSubmit = async (data: UserFormData, step?: number) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            // Convert role string to role_nid number
            let roleNid = 0
            const selectedRole = roles.find(r => {
                const rName = (r.vrole_name || r.role_name || '').toLowerCase()
                const dRole = (data.role || '').toLowerCase()
                return rName === dRole
            })

            if (selectedRole) {
                roleNid = selectedRole.nid || selectedRole.id || 0
            } else {
                if (data.role?.toLowerCase().includes('admin')) roleNid = 1
                else if (data.role?.toLowerCase().includes('teacher') || data.role?.toLowerCase().includes('guru')) roleNid = 2
                else if (data.role?.toLowerCase().includes('student') || data.role?.toLowerCase().includes('murid')) roleNid = 3
                else roleNid = 3
            }

            // Student must have a class assigned
            if (roleNid === 3 && !data.class_id) {
                toast.error('Student must select a class')
                setIsSubmitting(false)
                return
            }

            // Common formatted data for APIs
            const formattedData = {
                ...data,
                role_nid:     roleNid,
                birthdate:    data.birthdate    || '',
                address:      data.address      || '',
                phone:        data.phone        || '',
                whatsapp:     data.whatsapp     || '',
                nik:          data.nik          || '',
                degree:       data.degree       || '',
                // Student-specific
                nis:          data.nis          || '',
                class_id:     data.class_id     || '',
                class_name:   data.class_name   || '',
                parent_name:  data.parent_name  || '',
                parent_phone: data.parent_phone || '',
                status:       data.status       || 'active',
            }

            if (selectedUser) {
                // UPDATE FLOW
                const oldRoleNid = selectedUser.role_nid
                const newRoleNid = roleNid

                if (oldRoleNid !== newRoleNid) {
                    // Role changed → delete from old endpoint, create at new endpoint
                    console.log(`[UserManagement] Role changed: ${oldRoleNid} → ${newRoleNid}. Re-creating user profile...`)
                    try {
                        await userService.deleteUser(selectedUser.id, oldRoleNid, session.accessToken)
                    } catch (e) {
                        console.warn('[UserManagement] Old profile delete failed (may not exist):', e)
                    }
                    await userService.createUser(
                        { ...formattedData, password: data.password || 'ChangeMe@123' },
                        session.accessToken
                    )
                    toast.success('User role changed and profile updated!')
                } else {
                    // Same role → normal PUT
                    await userService.updateUser(
                        selectedUser.id,
                        newRoleNid,
                        { id: selectedUser.id, ...formattedData, password: data.password || undefined },
                        session.accessToken
                    )
                    toast.success('User profile updated successfully')
                }
            } else {
                // CREATE FLOW (Single call to comprehensive endpoint)
                await userService.createUser(formattedData, session.accessToken)
                toast.success('User created successfully with full profile!')
            }

            setIsFormOpen(false)
            fetchUsers()
        } catch (error: any) {
            console.error('[UserManagement] Flow error:', error)
            toast.error(error.message || 'Action failed')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase().trim()

        // Role filter
        if (roleFilter !== 'All Roles') {
            const userRole = (user.vrole_code || user.role_code || '').toUpperCase()
            if (roleFilter === 'admin' && !['ADMIN', 'ADM'].includes(userRole)) return false
            if (roleFilter === 'teacher' && !['GR'].includes(userRole)) return false
            if (roleFilter === 'student' && !['MR'].includes(userRole)) return false
        }

        // Search filter
        if (!term) return true

        const name = user.fullname?.toLowerCase() || ''
        const email = user.email?.toLowerCase() || ''
        const username = user.username?.toLowerCase() || ''

        return name.includes(term) || email.includes(term) || username.includes(term)
    })

    // Calculate statistics
    const totalUsers = users.length
    const adminCount = users.filter(u => ['ADMIN', 'ADM'].includes((u.vrole_code || u.role_code || '').toUpperCase())).length
    const teacherCount = users.filter(u => ['GR'].includes((u.vrole_code || u.role_code || '').toUpperCase())).length
    const studentCount = users.filter(u => ['MR'].includes((u.vrole_code || u.role_code || '').toUpperCase())).length

    const stats = [
        { label: 'Total Users', value: totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'Administrators', value: adminCount, icon: Shield, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
        { label: 'Teachers', value: teacherCount, icon: UserCheck, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { label: 'Students', value: studentCount, icon: GraduationCap, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', iconColor: 'text-green-600' }
    ]

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, roleFilter])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage system users and their roles efficiently
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImport}
                                className="hidden"
                                disabled={importing || !session?.accessToken}
                            />
                            <span className={`
                                inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700
                                transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                            `}>
                                {importing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                Import
                            </span>
                        </label>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </div>
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

                {/* Search and Filter Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        <Search className="h-5 w-5 text-gray-400" />
                        <Input
                            className="border-none text-black bg-transparent focus-visible:ring-0 p-0"
                            placeholder="Search by name, username, or email..."
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

                    <div className="flex items-center gap-3">
                        {/* Role Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="All Roles">
                                        {roleFilter === 'all' ? 'All Roles' : (roleFilter === 'All Roles' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1))}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                title="List View"
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count and Controls */}
                {!loading && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-600">
                        <p>
                            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                            <span className="font-semibold text-gray-900">{filteredUsers.length}</span> users
                        </p>
                        <div className="flex items-center gap-3">
                            {(searchTerm || roleFilter !== 'All Roles') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('')
                                        setRoleFilter('All Roles')
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Clear filters
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Show:</span>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(val: string) => {
                                        setItemsPerPage(Number(val))
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-[70px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="9">9</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 shadow-sm">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Loading users...</p>
                    </div>
                ) : viewMode === 'list' ? (
                    <UserList
                        users={paginatedUsers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ) : (
                    <UserGridView
                        items={paginatedUsers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        emptyMessage="No users found"
                        emptyDescription={
                            searchTerm || roleFilter !== 'All Roles'
                                ? 'Try adjusting your search or filters'
                                : 'Get started by adding your first user'
                        }
                    />
                )}

                {/* Pagination */}
                {!loading && filteredUsers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}

                {/* User Form Modal */}
                <UserForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    initialData={selectedUser}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    )
}
