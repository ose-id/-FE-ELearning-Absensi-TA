'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Search, Loader2, ClipboardCheck, Edit, Trash2, X, ListOrdered } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { learningModuleService } from '@/services/learning-module.service'
import { examService } from '@/services/exam.service'
import { LearningModule } from '@/types/learning-module'
import { Exam } from '@/types/exam'

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

export default function ModuleExamsPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)

    const [module, setModule] = useState<LearningModule | null>(null)
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingExam, setEditingExam] = useState<Exam | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState(60)
    const [passGrade, setPassGrade] = useState(60)
    const [status, setStatus] = useState(1)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showResults, setShowResults] = useState(1)
    const [fullscreen, setFullscreen] = useState(0)
    const [cutoff, setCutoff] = useState(0)

    useEffect(() => {
        if (session?.accessToken) {
            fetchModule()
            fetchExams()
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

    const fetchExams = async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await examService.getExamsByModule(moduleId, session.accessToken)
            setExams(response.data)
        } catch (error) {
            console.error('Failed to fetch exams:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingExam(null)
        setTitle('')
        setDescription('')
        setDuration(60)
        setPassGrade(60)
        setStatus(1)
        setStartDate('')
        setEndDate('')
        setShowResults(1)
        setFullscreen(0)
        setCutoff(0)
        setIsFormOpen(true)
    }

    const handleEdit = (exam: Exam) => {
        setEditingExam(exam)
        setTitle(exam.vtitle || '')
        setDescription(exam.vdescription || '')
        setDuration(exam.nduration || 60)
        setPassGrade(exam.npass_grade || 60)
        setStatus(exam.nstatus || 1)
        setStartDate(exam.dstart && !exam.dstart.startsWith('0001-01-01') ? exam.dstart.split('T')[0] : '')
        setEndDate(exam.dend && !exam.dend.startsWith('0001-01-01') ? exam.dend.split('T')[0] : '')
        setShowResults(exam.nshow_results || 1)
        setFullscreen(exam.nfullscreen || 0)
        setCutoff(exam.ncutoff || 0)
        setIsFormOpen(true)
    }

    const handleDelete = async (exam: Exam) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus ujian "${exam.vtitle}"?`)) return
        if (!session?.accessToken) return

        try {
            await examService.deleteExam(exam.nid, session.accessToken)
            toast.success('Ujian berhasil dihapus')
            fetchExams()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menghapus ujian'))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.accessToken) return

        // Validasi tanggal
        if (startDate && endDate) {
            if (new Date(endDate) < new Date(startDate)) {
                toast.error('Tanggal selesai tidak boleh kurang dari tanggal mulai')
                return
            }
        }

        const formattedStart = startDate ? `${startDate}T00:00:00` : new Date().toISOString().split('T')[0] + 'T00:00:00'
        const formattedEnd = endDate ? `${endDate}T23:59:59` : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59:59'

        try {
            setIsSubmitting(true)
            if (editingExam) {
                await examService.updateExam(
                    editingExam.nid,
                    {
                        nid_learning_module: moduleId,
                        vtitle: title,
                        vdescription: description || undefined,
                        nduration: duration || 60,
                        npass_grade: passGrade || 60,
                        nstatus: status,
                        dstart: formattedStart,
                        dend: formattedEnd,
                        nshow_results: showResults,
                        nfullscreen: fullscreen,
                        ncutoff: cutoff,
                    },
                    session.accessToken
                )
                toast.success('Ujian berhasil diperbarui')
            } else {
                await examService.createExam(
                    {
                        nid_learning_module: moduleId,
                        vtitle: title,
                        vdescription: description || undefined,
                        nduration: duration || 60,
                        npass_grade: passGrade || 60,
                        nstatus: status,
                        dstart: formattedStart,
                        dend: formattedEnd,
                        nshow_results: showResults,
                        nfullscreen: fullscreen,
                        ncutoff: cutoff,
                    },
                    session.accessToken
                )
                toast.success('Ujian berhasil dibuat')
            }
            setIsFormOpen(false)
            fetchExams()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menyimpan ujian'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredExams = exams.filter(e =>
        e.vtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.vdescription?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                Ujian - {module?.vname || 'Loading...'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Kelola ujian pembelajaran
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Ujian
                    </Button>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <Input
                            className="flex-1 border-none bg-transparent focus-visible:ring-0"
                            placeholder="Cari ujian..."
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
                    ) : filteredExams.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada ujian</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Ujian
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredExams.map((exam) => (
                                <div
                                    key={exam.nid}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <ClipboardCheck className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{exam.vtitle}</p>
                                            <p className="text-sm text-gray-500">{exam.vdescription || 'Tidak ada deskripsi'}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Durasi: {exam.nduration} menit | Pass Grade: {exam.npass_grade}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.push(`/learning-module-management/${moduleId}/exams/${exam.nid}/questions`)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Kelola Soal"
                                        >
                                            <ListOrdered className="h-4 w-4" />
                                        </button>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            exam.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {exam.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(exam)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exam)}
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
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    {editingExam ? 'Edit Ujian' : 'Tambah Ujian'}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul Ujian
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Masukkan judul ujian"
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
                                        placeholder="Masukkan deskripsi ujian"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Durasi (menit)
                                        </label>
                                        <Input
                                            type="number"
                                            value={isNaN(duration) ? '' : duration}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setDuration(isNaN(val) ? 0 : val);
                                            }}
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pass Grade
                                        </label>
                                        <Input
                                            type="number"
                                            value={isNaN(passGrade) ? '' : passGrade}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setPassGrade(isNaN(val) ? 0 : val);
                                            }}
                                            min={1}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value={1}>Aktif</option>
                                        <option value={0}>Nonaktif</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Selesai
                                        </label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tampilkan Hasil
                                        </label>
                                        <select
                                            value={showResults}
                                            onChange={(e) => setShowResults(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value={1}>Ya</option>
                                            <option value={0}>Tidak</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fullscreen
                                        </label>
                                        <select
                                            value={fullscreen}
                                            onChange={(e) => setFullscreen(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value={1}>Ya</option>
                                            <option value={0}>Tidak</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cutoff
                                        </label>
                                        <select
                                            value={cutoff}
                                            onChange={(e) => setCutoff(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value={1}>Ya</option>
                                            <option value={0}>Tidak</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Menyimpan...' : (editingExam ? 'Simpan' : 'Tambah')}
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
