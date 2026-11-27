'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, BookOpen, X, User, BookMarked, Edit, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { teacherSubjectService } from '@/services/teacher-subject.service'
import { roleService } from '@/services/role.service'
import { subjectService } from '@/services/subject.service'
import { TeacherSubject } from '@/types/teacher-subject'
import { Subject } from '@/types/subject'

export default function TeacherSubjectManagementPage() {
    const { data: session } = useSession()
    const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalRecords, setTotalRecords] = useState(0)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<TeacherSubject | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [teacherId, setTeacherId] = useState<string>('')
    const [subjectId, setSubjectId] = useState<string>('')

    const fetchTeacherSubjects = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await teacherSubjectService.getAll(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setTeacherSubjects(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            console.error('Failed to fetch teacher-subject:', error)
            toast.error(error.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const fetchTeachers = async () => {
        if (!session?.accessToken) return

        try {
            const response = await roleService.getUsersByRole(session.accessToken, 2)
            setTeachers(response.data || [])
        } catch (error: any) {
            console.error('Failed to fetch teachers:', error)
        }
    }

    const fetchSubjects = async () => {
        if (!session?.accessToken) return

        try {
            const response = await subjectService.getAllSubjects(session.accessToken, 1, 100)
            setSubjects(response.data || [])
        } catch (error: any) {
            console.error('Failed to fetch subjects:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchTeacherSubjects()
            fetchTeachers()
            fetchSubjects()
        }
    }, [session, currentPage, searchTerm])

    const handleCreate = () => {
        setSelectedItem(null)
        setTeacherId('')
        setSubjectId('')
        setIsFormOpen(true)
    }

    const handleEdit = (item: TeacherSubject) => {
        setSelectedItem(item)
        setTeacherId(item.nid_teacher?.toString() || '')
        setSubjectId(item.nid_subject?.toString() || '')
        setIsFormOpen(true)
    }

    const handleDelete = async (item: TeacherSubject) => {
        if (!confirm(`Hapus penugasan guru ke mata pelajaran ini?`)) return
        if (!session?.accessToken) return

        try {
            console.log('=== DELETE DEBUG ===')
            console.log('Deleting ID:', item.nid)
            console.log('Endpoint:', `${process.env.NEXT_PUBLIC_CLASS_API_URL || 'https://localhost:5003'}/api/TeacherSubject/${item.nid}`)

            await teacherSubjectService.delete(item.nid, session.accessToken)
            console.log('Delete API success')
            toast.success('Penugasan berhasil dihapus')
            fetchTeacherSubjects()
        } catch (error: any) {
            console.error('=== DELETE ERROR ===')
            console.error(error)
            const errorMsg = error.message?.toLowerCase() || ''

            // Check for common foreign key error patterns
            if (errorMsg.includes('foreign key') ||
                errorMsg.includes('constraint') ||
                errorMsg.includes('reference') ||
                errorMsg.includes('used') ||
                errorMsg.includes('relasi') ||
                errorMsg.includes('dipakai') ||
                errorMsg.includes('used by')) {
                toast.error('Tidak bisa dihapus! Data ini masih digunakan di tabel lain (misal: Learning Module)')
            } else {
                toast.error(error.message || 'Failed to delete')
            }
        }
    }

    const handleSubmit = async () => {
        if (!session?.accessToken) return

        if (!teacherId || !subjectId) {
            toast.error('Mohon pilih Guru dan Mata Pelajaran')
            return
        }

        try {
            setIsSubmitting(true)

            if (selectedItem) {
                await teacherSubjectService.update(
                    selectedItem.nid,
                    {
                        TeacherId: parseInt(teacherId) || 0,
                        SubjectId: parseInt(subjectId) || 0,
                    },
                    session.accessToken
                )
                toast.success('Penugasan berhasil diperbarui')
            } else {
                await teacherSubjectService.create(
                    {
                        TeacherId: parseInt(teacherId) || 0,
                        SubjectId: parseInt(subjectId) || 0,
                    },
                    session.accessToken
                )
                toast.success('Penugasan berhasil dibuat')
            }

            setIsFormOpen(false)
            fetchTeacherSubjects()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper function to get teacher name by ID
    const getTeacherName = (teacherId: number) => {
        const teacher = teachers.find(t =>
            t.id === teacherId ||
            t.nid === teacherId ||
            t.nid_teacher === teacherId
        )
        return teacher?.vfullname || teacher?.fullname || teacher?.username || `Guru #${teacherId}`
    }

    // Helper function to get subject name by ID
    const getSubjectName = (subjectId: number) => {
        const subject = subjects.find(s => s.nid === subjectId)
        return subject?.vsubject_name || `Subject #${subjectId}`
    }

    // Debug: log data when loaded
    useEffect(() => {
        if (teachers.length > 0) {
            console.log('Teachers loaded:', teachers.slice(0, 3))
        }
    }, [teachers])

    useEffect(() => {
        if (subjects.length > 0) {
            console.log('Subjects loaded:', subjects.slice(0, 3))
        }
    }, [subjects])

    const filteredData = teacherSubjects.filter(item => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        const teacherName = getTeacherName(item.nid_teacher).toLowerCase()
        const subjectName = getSubjectName(item.nid_subject).toLowerCase()
        return teacherName.includes(term) || subjectName.includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Teacher Subject Assignment
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Assign teachers to subjects
                        </p>
                    </div>
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Teacher
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 text-gray-500" />
                    <Input
                        className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0"
                        placeholder="Search teacher or subject..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="rounded-full p-1 hover:bg-gray-100">
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                                <p className="text-gray-600">Loading...</p>
                            </div>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No assignments found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Guru</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Mata Pelajaran</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item) => (
                                        <tr key={item.nid} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {getTeacherName(item.nid_teacher)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <BookMarked className="h-4 w-4 text-green-500" />
                                                    {getSubjectName(item.nid_subject)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.nstatus === 1
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {item.nstatus === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalRecords > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}

                {/* Form Dialog */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-4">
                                {selectedItem ? 'Edit Teacher Subject' : 'Tambah Teacher Subject'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Guru <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={teacherId} onValueChange={setTeacherId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Guru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={String(teacher.id || '')}>
                                                    {teacher.fullname || teacher.vfullname || teacher.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mata Pelajaran <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={subjectId} onValueChange={setSubjectId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Mata Pelajaran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject.nid} value={String(subject.nid || '')}>
                                                    {subject.vsubject_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsFormOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !teacherId || !subjectId}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
