
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { classService } from '@/services/class.service'
import { userService } from '@/services/user.service'
import { Class } from '@/types/class'
import { User } from '@/types/user'
import ClassList from './ClassList'
import ClassForm, { ClassFormData } from './ClassForm'

export default function ClassManagementPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<Class[]>([])
    const [teachers, setTeachers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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
                // Filter for teachers (Assuming role_id 2 is Teacher based on UserForm)
                // Also including Admins (role_id 1) as they might teach too? 
                // For now, let's include everyone or typically just Teachers.
                // Let's filter for role_id 2 (Teacher) or 1 (Admin) just in case.
                const teacherList = usersRes.data.filter(u => u.role_id === 2 || u.role_id === 1 || u.role_name === 'Teacher' || u.role_name === 'Guru')
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
            fetchData() // Refresh list
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete class')
        }
    }

    const handleFormSubmit = async (data: ClassFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedClass) {
                // Update
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
                // Create
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
        if (!term) return true

        const name = cls.name?.toLowerCase() || ''
        const code = cls.code?.toLowerCase() || ''
        const description = cls.description?.toLowerCase() || ''
        const teacher = cls.teacher_name?.toLowerCase() || ''

        return name.includes(term) || code.includes(term) || description.includes(term) || teacher.includes(term)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
                    <p className="text-sm text-gray-500">
                        Manage classes and assign teachers
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Class
                </Button>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                    className="border-none text-black bg-transparent focus-visible:ring-0"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <ClassList
                    classes={filteredClasses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <ClassForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                initialData={selectedClass}
                isSubmitting={isSubmitting}
                teachers={teachers}
            />
        </div>
    )
}
