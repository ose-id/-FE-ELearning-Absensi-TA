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
import { roleService } from '@/services/role.service'
import { userService } from '@/services/user.service'
import { User } from '@/types/user'
import { Role } from '@/types/role'
import UserList from './UserList'
import UserForm, { UserFormData } from './UserForm'

type ViewMode = 'list' | 'grid'

export type UserCategory = 'admin' | 'teacher' | 'student'

interface BaseUserManagementPageProps {
    category: UserCategory
    endpoint: string
    title: string
    description: string
    roleNid: number
    icon: React.ComponentType<{ className?: string }>
    statsIcon: React.ComponentType<{ className?: string }>
    statsColor: {
        iconColor: string
        bgColor: string
        color: string
    }
}

export default function BaseUserManagementPage({
    category,
    endpoint,
    title,
    description,
    roleNid,
    icon: IconComponent,
    statsIcon: StatsIcon,
    statsColor
}: BaseUserManagementPageProps) {
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
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
            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch ${category}: ${response.statusText}`)
            }

            const result = await response.json()
            const usersData = result.data || result || []

            // Tag users with role_nid for edit/delete operations
            const taggedUsers = (usersData as User[]).map((u) => ({
                ...u,
                role_nid: u.role_nid ?? u.role_id ?? roleNid,
                _uid: `${roleNid}:${u.nid ?? u.id}`
            }))

            setUsers(taggedUsers)
        } catch (error) {
            console.error(`Failed to fetch ${category}:`, error)
            toast.error(error instanceof Error ? error.message : `Failed to list ${category}`)
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
        } catch (error) {
            console.error('Failed to fetch roles:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchUsers()
            fetchRoles()
        }
    }, [session, endpoint, category])

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
            const deleteEndpoint = category === 'admin'
                ? `${endpoint}/${user.id}`
                : category === 'teacher'
                ? `${endpoint}/${user.id}`
                : `${endpoint}/${user.id}`

            const response = await fetch(deleteEndpoint, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session.accessToken}` }
            })

            if (!response.ok) {
                throw new Error('Failed to delete user')
            }

            toast.success(`${category === 'admin' ? 'Admin' : category === 'teacher' ? 'Guru' : 'Murid'} deleted successfully`)
            fetchUsers()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete user')
        }
    }

    // Export users to Excel - matching import template fields
    const handleExport = () => {
        if (users.length === 0) {
            toast.warning(`No ${category} to export`)
            return
        }

        let exportData: Record<string, string | number>[]

        if (category === 'student') {
            exportData = users.map(user => ({
                'username': user.username || '',
                'email': user.email || '',
                'password': '',  // Don't export passwords for security
                'fullname': user.fullname || '',
                'nis': user.nis || '',
                'class_id': user.class_id || '',
                'phone': user.phone || '',
                'whatsapp': user.whatsapp || '',
                'birthdate': user.birthdate || '',
                'address': user.address || '',
                'parent_name': user.parent_name || '',
                'parent_phone': user.parent_phone || '',
                'status': user.status || '',
            }))
        } else {
            // Teacher or Admin
            exportData = users.map(user => ({
                'username': user.username || '',
                'email': user.email || '',
                'password': '',  // Don't export passwords for security
                'fullname': user.fullname || '',
                'nip': user.nip || '',
                'degree': user.degree || '',
                'phone': user.phone || '',
                'whatsapp': user.whatsapp || '',
                'birthdate': user.birthdate || '',
                'address': user.address || '',
                'status': user.status || '',
            }))
        }

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, category === 'admin' ? 'Admins' : category === 'teacher' ? 'Teachers' : 'Students')
        XLSX.writeFile(wb, `${category}_export_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success(`${category === 'admin' ? 'Admins' : category === 'teacher' ? 'Teachers' : 'Students'} exported successfully`)
    }

    // Download import template
    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'username': 'johndoe',
                'email': 'john.doe@example.com',
                'password': 'ChangeMe@123',
                'fullname': 'John Doe',
                'nip': '1234567890123456',  // NIP for teacher/admin
                'degree': 'S.Kom',
                'phone': '+6281234567890',
                'whatsapp': '+6281234567890',
                'birthdate': '1990-01-01',
                'address': 'Jl. Example No. 123, Jakarta',
                'status': 'active',
            }
        ]

        // For students, use different template
        const studentTemplateData = [
            {
                'username': 'anisaja',
                'email': 'ani@example.com',
                'password': 'ChangeMe@123',
                'fullname': 'Ani Saja',
                'nis': '12345',  // NIS for student
                'class_id': '1',
                'phone': '+6281234567890',
                'whatsapp': '+6281234567890',
                'birthdate': '2010-01-01',
                'address': 'Jl. Example No. 123, Jakarta',
                'parent_name': 'Budi',
                'parent_phone': '+6281234567891',
                'status': 'active',
            }
        ]

        const ws = XLSX.utils.json_to_sheet(category === 'student' ? studentTemplateData : templateData)

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // username
            { wch: 35 }, // email
            { wch: 20 }, // password
            { wch: 30 }, // fullname
            ...(category === 'student' ? [
                { wch: 15 }, // nis
                { wch: 10 }, // class_id
                { wch: 25 }, // parent_name
                { wch: 15 }, // parent_phone
            ] : [
                { wch: 20 }, // nip
                { wch: 15 }, // degree
            ]),
            { wch: 15 }, // phone
            { wch: 15 }, // whatsapp
            { wch: 15 }, // birthdate
            { wch: 40 }, // address
            { wch: 10 }, // status
        ]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Template')
        XLSX.writeFile(wb, `${category}_import_template.xlsx`)
        toast.success('Template downloaded successfully')
    }

    // Import users from Excel
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!session?.accessToken) {
            toast.error('Session expired. Please login again.')
            return
        }

        setImporting(true)
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            type ExcelRow = Record<string, string | number | boolean | null | undefined>
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]

            if (jsonData.length === 0) {
                toast.warning('No data found in the file')
                setImporting(false)
                return
            }

            let successCount = 0
            let errorCount = 0

            for (const row of jsonData) {
                try {
                    // Build payload matching userService.createUser format
                    let importData: CreateUserRequest & { nip?: string }

                    if (category === 'student') {
                        // Student payload
                        importData = {
                            username: row['username'] || row['Username'] || '',
                            email: row['email'] || row['Email'] || '',
                            password: row['password'] || row['Password'] || 'ChangeMe@123',
                            fullname: row['fullname'] || row['fullname'] || '',
                            birthdate: row['birthdate'] || row['Birthdate'] || '',
                            address: row['address'] || row['Address'] || '',
                            phone: row['phone'] || row['Phone'] || '',
                            whatsapp: row['whatsapp'] || row['WhatsApp'] || '',
                            nis: row['nis'] || row['NIS'] || '',
                            class_id: row['class_id'] || row['Class ID'] || '',
                            parent_name: row['parent_name'] || row['Parent Name'] || '',
                            parent_phone: row['parent_phone'] || row['Parent Phone'] || '',
                            status: row['status'] || row['Status'] || 'active',
                            role_nid: 3,
                        }
                    } else {
                        // Teacher/Admin payload
                        importData = {
                            username: row['username'] || row['Username'] || '',
                            email: row['email'] || row['Email'] || '',
                            password: row['password'] || row['Password'] || 'ChangeMe@123',
                            fullname: row['fullname'] || row['Full Name'] || '',
                            fullName: row['fullname'] || row['Full Name'] || '',
                            nip: row['nip'] || row['NIP'] || row['nik'] || row['NIK'] || '',
                            degree: row['degree'] || row['Degree'] || '',
                            birthdate: row['birthdate'] || row['Birthdate'] || '',
                            address: row['address'] || row['Address'] || '',
                            phone: row['phone'] || row['Phone'] || '',
                            whatsapp: row['whatsapp'] || row['WhatsApp'] || '',
                            status: row['status'] || row['Status'] || 'active',
                            role_nid: roleNid,
                        }
                    }

                    // Validate required fields
                    if (!importData.username || !importData.email || !importData.fullname) {
                        console.warn('Skipping row with missing required fields:', importData)
                        errorCount++
                        continue
                    }

                    // Use userService.createUser (same as "Add User" button)
                    await userService.createUser(importData, session.accessToken)
                    successCount++
                } catch (e) {
                    errorCount++
                    console.error('Failed to import row:', row, e)
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} ${category === 'admin' ? 'admin(s)' : category === 'teacher' ? 'guru(s)' : 'student(s)'}`)
                fetchUsers()
            }
            if (errorCount > 0) {
                toast.warning(`Failed to import ${errorCount} rows`)
            }
        } catch (error) {
            console.error('Import error:', error)
            const errorDetail = error instanceof Error ? error.message : String(error)
            toast.error(errorDetail)
        } finally {
            setImporting(false)
            event.target.value = ''
        }
    }

    const handleFormSubmit = async (data: UserFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            // Build payload based on category (matching user.service.ts format)
            let payload: Record<string, unknown>

            if (category === 'student') {
                // Student payload (/api/Student)
                payload = {
                    username:     data.username,
                    email:        data.email,
                    password:     data.password || 'ChangeMe@123',
                    fullname:     data.fullname || '',
                    birthdate:    data.birthdate || '',
                    address:      data.address || '',
                    phone:        data.phone || '',
                    whatsapp:     data.whatsapp || '',
                    nis:          data.nis || '',
                    ...(data.class_id && Number(data.class_id) > 0 ? { class_id: Number(data.class_id) } : {}),
                    parent_name:  data.parent_name || '',
                    parent_phone: data.parent_phone || '',
                    status:       data.status || 'active',
                }
            } else {
                // Admin / Teacher payload (/api/User/staff or /api/Teacher)
                payload = {
                    username:  data.username,
                    email:     data.email,
                    password:  data.password || 'ChangeMe@123',
                    fullName:  data.fullname || '',
                    fullname:  data.fullname || '',
                    nip:       data.nik || '',
                    degree:    data.degree || '',
                    birthdate: data.birthdate || '',
                    address:   data.address || '',
                    phone:     data.phone || '',
                    whatsapp:  data.whatsapp || '',
                    status:    data.status || 'active',
                    role_nid:  roleNid,
                }
            }

            if (selectedUser) {
                // UPDATE - remove password if not changed
                const updatePayload = { ...payload }
                if (!data.password) {
                    delete updatePayload.password
                }

                const response = await fetch(`${endpoint}/${selectedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.accessToken}`
                    },
                    body: JSON.stringify(updatePayload)
                })

                if (!response.ok) {
                    throw new Error('Failed to update user')
                }

                toast.success(`${category === 'admin' ? 'Admin' : category === 'teacher' ? 'Guru' : 'Murid'} updated successfully`)
            } else {
                // CREATE - Use correct endpoint based on role
                // - Guru (roleNid 2): /api/Teacher (creates User + Teacher profile)
                // - Murid (roleNid 3): /api/Student (creates User + Student profile)
                const createEndpoint = roleNid === 2
                    ? `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://localhost:5001'}/api/Teacher`
                    : roleNid === 3
                        ? `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://localhost:5001'}/api/Student`
                        : endpoint

                const response = await fetch(createEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.accessToken}`
                    },
                    body: JSON.stringify(payload)
                })

                if (!response.ok) {
                    throw new Error('Failed to create user')
                }

                toast.success(`${category === 'admin' ? 'Admin' : category === 'teacher' ? 'Guru' : 'Murid'} created successfully`)
            }

            setIsFormOpen(false)
            fetchUsers()
        } catch (error) {
            console.error('[BaseUserManagement] Flow error:', error)
            toast.error(error instanceof Error ? error.message : 'Action failed')
            throw error
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

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const categoryLabel = category === 'admin' ? 'Administrator' : category === 'teacher' ? 'Guru' : 'Murid'
    const categoryLabelLower = category === 'admin' ? 'administrator' : category === 'teacher' ? 'guru' : 'murid'

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {description}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={handleDownloadTemplate}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Template
                        </Button>
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
                            Add {categoryLabel}
                        </Button>
                    </div>
                </div>



                {/* Search and Filter Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        <Search className="h-5 w-5 text-gray-400" />
                        <Input
                            className="border-none text-black bg-transparent focus-visible:ring-0 p-0"
                            placeholder={`Search by name, username, or email...`}
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

                {/* Results Count */}
                {!loading && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-600">
                        <p>
                            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                            <span className="font-semibold text-gray-900">{filteredUsers.length}</span> {categoryLabelLower}
                        </p>
                        {(searchTerm) && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Clear search
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
                )}

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 shadow-sm">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Loading {categoryLabelLower}...</p>
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
                        emptyMessage={`No ${categoryLabelLower} found`}
                        emptyDescription={
                            searchTerm
                                ? 'Try adjusting your search'
                                : `Get started by adding your first ${categoryLabelLower}`
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
                    fixedRoleNid={roleNid}
                />
            </div>
        </div>
    )
}
