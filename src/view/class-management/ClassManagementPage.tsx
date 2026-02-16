
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, BookOpen, Users, GraduationCap, Filter, X, LayoutGrid, List } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { classService } from '@/services/class.service'
import { userService } from '@/services/user.service'
import { Class } from '@/types/class'
import { User } from '@/types/user'
import ClassList from './ClassList'
import ClassForm, { ClassFormData } from './ClassForm'

type ViewMode = 'list' | 'grid'

export default function ClassManagementPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<Class[]>([])
    const [teachers, setTeachers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [teacherFilter, setTeacherFilter] = useState<string>('All Teachers')
    const [viewMode, setViewMode] = useState<ViewMode>('list')

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState<Class | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)

            // Parallel fetch
            const [classesRes, usersRes] = await Promise.all([
                classService.getClasses(session.accessToken).catch(err => {
                    console.error("Failed to fetch classes", err)
                    return { data: [] }
                }),
                userService.getUsers(session.accessToken).catch(err => {
                    console.error("Failed to fetch users", err)
                    return { data: [] }
                })
            ])

            if (classesRes && classesRes.data) {
                setClasses(classesRes.data)
            }

            if (usersRes && usersRes.data) {
                const teacherList = usersRes.data.filter(u =>
                    ['TEACHER', 'GURU', 'TCR'].includes(u.role_code?.toUpperCase() || '')
                )
                setTeachers(teacherList)
            }

        } catch (error: any) {
            console.error('Failed to fetch data:', error)
            toast.error(error.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [session])

    const handleCreate = () => {
        setSelectedClass(null)
        setIsFormOpen(true)
    }

    const handleEdit = (cls: Class) => {
        setSelectedClass(cls)
        setIsFormOpen(true)
    }

    const handleDelete = async (cls: Class) => {
        if (!confirm(`Are you sure you want to delete class ${cls.name}?`)) return

        if (!session?.accessToken) return

        try {
            await classService.deleteClass(cls.id, session.accessToken)
            toast.success('Class deleted successfully')
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete class')
        }
    }

    const handleFormSubmit = async (data: ClassFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedClass) {
                await classService.updateClass(
                    selectedClass.id,
                    {
                        id: selectedClass.id,
                        name: data.name,
                        description: data.description || '',
                        teacher_id: data.teacher_id,
                    },
                    session.accessToken
                )
                toast.success('Class updated successfully')
            } else {
                await classService.createClass(
                    {
                        name: data.name,
                        description: data.description || '',
                        teacher_id: data.teacher_id,
                    },
                    session.accessToken
                )
                toast.success('Class created successfully')
            }

            setIsFormOpen(false)
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save class')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredClasses = classes.filter((cls) => {
        const term = searchTerm.toLowerCase().trim()

        // Teacher filter
        if (teacherFilter !== 'All Teachers') {
            if (cls.teacher_id?.toString() !== teacherFilter) return false
        }

        // Search filter
        if (!term) return true

        const name = cls.name?.toLowerCase() || ''
        const code = cls.code?.toLowerCase() || ''
        const description = cls.description?.toLowerCase() || ''
        const teacher = cls.teacher_name?.toLowerCase() || ''

        return name.includes(term) || code.includes(term) || description.includes(term) || teacher.includes(term)
    })

    // Statistics
    const totalClasses = classes.length
    const activeClasses = classes.length // TODO: Add active status to Class model
    const totalTeachers = teachers.length
    const avgStudentsPerClass = 0 // TODO: Get from enrollments API

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Section - Same style as User Management */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Class Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage classes and assign teachers efficiently
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                    </Button>
                </div>

                {/* Statistics Cards - Same style as User Management */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Classes</p>
                                <p className="text-3xl font-bold text-gray-900">{totalClasses}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 transition-transform duration-300 group-hover:scale-110">
                                <BookOpen className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Active Classes</p>
                                <p className="text-3xl font-bold text-gray-900">{activeClasses}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 transition-transform duration-300 group-hover:scale-110">
                                <BookOpen className="h-7 w-7 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Teachers</p>
                                <p className="text-3xl font-bold text-gray-900">{totalTeachers}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 transition-transform duration-300 group-hover:scale-110">
                                <Users className="h-7 w-7 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Avg Students</p>
                                <p className="text-3xl font-bold text-gray-900">{avgStudentsPerClass}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 transition-transform duration-300 group-hover:scale-110">
                                <GraduationCap className="h-7 w-7 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters - Same style as User Management */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <Search className="h-5 w-5 text-gray-500" />
                            <Input
                                className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                placeholder="Search by class name, code, description, or teacher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="rounded-full p-1 hover:bg-gray-200 transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                {/* Teacher Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="All Teachers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Teachers">All Teachers</SelectItem>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.fullname}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* View Toggle */}
                                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`rounded-lg p-2 transition-colors ${viewMode === 'list'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-lg p-2 transition-colors ${viewMode === 'grid'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{filteredClasses.length}</span> classes
                                </p>
                                {(searchTerm || teacherFilter !== 'All Teachers') && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('')
                                            setTeacherFilter('All Teachers')
                                        }}
                                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Class List */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading classes...</p>
                                </div>
                            </div>
                        ) : (
                            <ClassList
                                classes={filteredClasses}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                viewMode={viewMode}
                            />
                        )}
                    </div>
                </div>

                <ClassForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    initialData={selectedClass}
                    isSubmitting={isSubmitting}
                    teachers={teachers}
                />
            </div>
        </div>
    )
}
