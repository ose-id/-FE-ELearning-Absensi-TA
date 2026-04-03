'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, BookMarked, Filter, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { subjectService } from '@/services/subject.service'
import { departmentService } from '@/services/department.service'
import { Subject } from '@/types/subject'
import { Department } from '@/types/department'
import SubjectList from './SubjectList'
import SubjectForm, { SubjectFormData } from './SubjectForm'

export default function SubjectManagementPage() {
    const { data: session } = useSession()
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState<string>('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalRecords, setTotalRecords] = useState(0)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchSubjects = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await subjectService.getAllSubjects(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setSubjects(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            console.error('Failed to fetch subjects:', error)
            toast.error(error.message || 'Failed to load subjects')
        } finally {
            setLoading(false)
        }
    }

    const fetchDepartments = async () => {
        if (!session?.accessToken) return
        try {
            const response = await departmentService.getAllDepartments(session.accessToken, 1, 100)
            setDepartments(response.data)
        } catch (error: any) {
            console.error('Failed to fetch departments:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchSubjects()
            fetchDepartments()
        }
    }, [session, currentPage, searchTerm])

    const handleCreate = () => {
        setSelectedSubject(null)
        setIsFormOpen(true)
    }

    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject)
        setIsFormOpen(true)
    }

    const handleDelete = async (subject: Subject) => {
        if (!confirm(`Are you sure you want to delete subject "${subject.vsubject_name}"?`)) return

        if (!session?.accessToken) return

        try {
            await subjectService.deleteSubject(subject.nid, session.accessToken)
            toast.success('Subject deleted successfully')
            fetchSubjects()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete subject')
        }
    }

    const handleFormSubmit = async (data: SubjectFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedSubject) {
                await subjectService.updateSubject(
                    selectedSubject.nid,
                    { SubjectName: data.subject_name, DepartmentId: data.department_id },
                    session.accessToken
                )
                toast.success('Subject updated successfully')
            } else {
                await subjectService.createSubject(
                    { SubjectName: data.subject_name, DepartmentId: data.department_id },
                    session.accessToken
                )
                toast.success('Subject created successfully')
            }

            setIsFormOpen(false)
            fetchSubjects()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save subject')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredSubjects = subjects.filter((subject) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return subject.vsubject_name?.toLowerCase().includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Subject Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage subjects for your institution
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subject
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Subjects</p>
                                <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                                <BookMarked className="h-7 w-7 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-1">
                                <Search className="h-5 w-5 text-gray-500" />
                                <Input
                                    className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    placeholder="Search subjects..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setCurrentPage(1)
                                    }}
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

                            <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{filteredSubjects.length}</span> subjects
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading subjects...</p>
                                </div>
                            </div>
                        ) : (
                            <SubjectList
                                subjects={filteredSubjects}
                                departments={departments}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>

                {!loading && totalRecords > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}

                <SubjectForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    initialData={selectedSubject}
                    isSubmitting={isSubmitting}
                    departments={departments}
                />
            </div>
        </div>
    )
}
