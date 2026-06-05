'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Search, Loader2, PenLine, Edit, Trash2, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { learningModuleService } from '@/services/learning-module.service'
import { assignmentService } from '@/services/assignment.service'
import { LearningModule } from '@/types/learning-module'
import { Assignment } from '@/types/assignment'

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

export default function ModuleAssignmentsPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)

    const [module, setModule] = useState<LearningModule | null>(null)
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [maxScore, setMaxScore] = useState(100)
    const [classId, setClassId] = useState<number>(0)

    useEffect(() => {
        if (session?.accessToken) {
            fetchModule()
            fetchAssignments()
        }
    }, [session?.accessToken, moduleId])

    const fetchModule = async () => {
        if (!session?.accessToken) return
        try {
            const teacherId = parseInt(session.user?.id || '0')
            const response = await learningModuleService.getAllLearningModules(
                session.accessToken,
                1,
                100,
                undefined,
                teacherId
            )
            const foundModule = response.data.find(m => m.nid === moduleId)
            setModule(foundModule || null)
        } catch (error) {
            console.error('Failed to fetch module:', error)
        }
    }

    const fetchAssignments = async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await assignmentService.getAssignments(session.accessToken)
            const filtered = response.data?.filter((a: Assignment) => a.learning_module_id === moduleId) || []
            setAssignments(filtered)
        } catch (error) {
            console.error('Failed to fetch assignments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingAssignment(null)
        setTitle('')
        setDescription('')
        setDueDate('')
        setMaxScore(100)
        setClassId(module?.nid_class || 0)
        setIsFormOpen(true)
    }

    const handleEdit = (assignment: Assignment) => {
        setEditingAssignment(assignment)
        setTitle(assignment.title)
        setDescription(assignment.description)
        setDueDate(assignment.due_date && !assignment.due_date.startsWith('0001-01-01') ? assignment.due_date.split('T')[0] : '')
        setMaxScore(assignment.max_score)
        setClassId(assignment.class_id)
        setIsFormOpen(true)
    }

    const handleDelete = async (assignment: Assignment) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus tugas "${assignment.title}"?`)) return
        if (!session?.accessToken) return

        try {
            await assignmentService.deleteAssignment(assignment.id, session.accessToken)
            toast.success('Tugas berhasil dihapus')
            fetchAssignments()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menghapus tugas'))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)
            if (editingAssignment) {
                await assignmentService.updateAssignment(
                    editingAssignment.id,
                    {
                        title,
                        description,
                        dueDate,
                        allowLateSubmission: true,
                        enableCutoff: false,
                        status: 1,
                    },
                    session.accessToken
                )
                toast.success('Tugas berhasil diperbarui')
            } else {
                await assignmentService.createAssignment(
                    {
                        title,
                        description,
                        learningModuleId: moduleId,
                        dueDate,
                        allowLateSubmission: true,
                        enableCutoff: false,
                    },
                    session.accessToken
                )
                toast.success('Tugas berhasil dibuat')
            }
            setIsFormOpen(false)
            fetchAssignments()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menyimpan tugas'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredAssignments = assignments.filter(a =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/learning-module-management/${moduleId}`)}
                            className="p-2 hover:bg-white rounded-lg border border-gray-200"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Tugas - {module?.vname || 'Loading...'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Kelola tugas pembelajaran
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
                    </Button>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <Input
                            className="flex-1 border-none bg-transparent focus-visible:ring-0"
                            placeholder="Cari tugas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')}>
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-12">
                            <PenLine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada tugas</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredAssignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <PenLine className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{assignment.title}</p>
                                            <p className="text-sm text-gray-500">{assignment.description || 'Tidak ada deskripsi'}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Batas: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('id-ID') : '-'} | Max Score: {assignment.max_score}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(assignment)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(assignment)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    {editingAssignment ? 'Edit Tugas' : 'Tambah Tugas'}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul Tugas
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Masukkan judul tugas"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Masukkan deskripsi tugas"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Batas Tanggal
                                        </label>
                                        <Input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nilai Maksimal
                                        </label>
                                        <Input
                                            type="number"
                                            value={maxScore}
                                            onChange={(e) => setMaxScore(parseInt(e.target.value))}
                                            min={1}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Menyimpan...' : (editingAssignment ? 'Simpan' : 'Tambah')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
