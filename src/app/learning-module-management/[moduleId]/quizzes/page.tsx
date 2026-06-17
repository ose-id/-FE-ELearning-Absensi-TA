'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Search, Loader2, FileText, Edit, Trash2, X, ListOrdered } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { learningModuleService } from '@/services/learning-module.service'
import { quizService } from '@/services/quiz.service'
import { LearningModule } from '@/types/learning-module'
import { Quiz } from '@/types/quiz'

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

function getTodayString() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default function ModuleQuizzesPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)

    const [module, setModule] = useState<LearningModule | null>(null)
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState(30)
    const [maxScore, setMaxScore] = useState(100)
    const [passingScore, setPassingScore] = useState(60)
    const [status, setStatus] = useState(1)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showResults, setShowResults] = useState(1)

    const fetchModule = useCallback(async () => {
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
    }, [session?.accessToken, moduleId])

    const fetchQuizzes = useCallback(async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await quizService.getQuizzesByModule(moduleId, session.accessToken)
            setQuizzes(response.data)
        } catch (error) {
            console.error('Failed to fetch quizzes:', error)
        } finally {
            setLoading(false)
        }
    }, [session?.accessToken, moduleId])

    useEffect(() => {
        if (session?.accessToken) {
            fetchModule()
            fetchQuizzes()
        }
    }, [session?.accessToken, moduleId, fetchModule, fetchQuizzes])

    const handleCreate = () => {
        setEditingQuiz(null)
        setTitle('')
        setDescription('')
        setDuration(30)
        setMaxScore(100)
        setPassingScore(60)
        setStatus(1)
        setStartDate('')
        setEndDate('')
        setShowResults(1)
        setIsFormOpen(true)
    }

    const handleEdit = (quiz: Quiz) => {
        setEditingQuiz(quiz)
        setTitle(quiz.vtitle)
        setDescription(quiz.vdesc || '')
        setDuration(quiz.nduration || 30)
        setMaxScore(quiz.nmax_score || 100)
        setPassingScore(quiz.npassing_score || 60)
        setStatus(quiz.nstatus || 1)
        setStartDate(quiz.dstart && !quiz.dstart.startsWith('0001-01-01') ? quiz.dstart.split('T')[0] : '')
        setEndDate(quiz.dend && !quiz.dend.startsWith('0001-01-01') ? quiz.dend.split('T')[0] : '')
        setShowResults(quiz.nshow_results !== undefined ? quiz.nshow_results : 1)
        setIsFormOpen(true)
    }

    const handleDelete = async (quiz: Quiz) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus quiz "${quiz.vtitle}"?`)) return
        if (!session?.accessToken) return

        try {
            await quizService.deleteQuiz(quiz.nid, session.accessToken)
            toast.success('Quiz berhasil dihapus')
            fetchQuizzes()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menghapus quiz'))
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

        try {
            setIsSubmitting(true)
            if (editingQuiz) {
                await quizService.updateQuiz(
                    editingQuiz.nid,
                    {
                        Title: title,
                        Description: description,
                        Duration: duration,
                        MaxScore: maxScore,
                        PassingScore: passingScore,
                        Status: status,
                        StartDate: startDate || undefined,
                        EndDate: endDate || undefined,
                        ShowResults: showResults,
                    },
                    session.accessToken
                )
                toast.success('Quiz berhasil diperbarui')
            } else {
                await quizService.createQuiz(
                    {
                        Title: title,
                        Description: description,
                        LearningModuleId: moduleId,
                        Duration: duration,
                        MaxScore: maxScore,
                        PassingScore: passingScore,
                        Status: status,
                        StartDate: startDate || undefined,
                        EndDate: endDate || undefined,
                        ShowResults: showResults,
                    },
                    session.accessToken
                )
                toast.success('Quiz berhasil dibuat')
            }
            setIsFormOpen(false)
            fetchQuizzes()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menyimpan quiz'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredQuizzes = quizzes.filter(q =>
        q.vtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.vdesc?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                Quiz - {module?.vname || 'Loading...'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Kelola quiz pembelajaran
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Quiz
                    </Button>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <Input
                            className="flex-1 border-none bg-transparent focus-visible:ring-0"
                            placeholder="Cari quiz..."
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
                    ) : filteredQuizzes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada quiz</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Quiz
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredQuizzes.map((quiz) => (
                                <div
                                    key={quiz.nid}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{quiz.vtitle}</p>
                                            <p className="text-sm text-gray-500">{quiz.vdesc || 'Tidak ada deskripsi'}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Durasi: {quiz.nduration} menit | Max Score: {quiz.nmax_score} | Passing: {quiz.npassing_score}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.push(`/learning-module-management/${moduleId}/quizzes/${quiz.nid}/questions`)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                                            title="Kelola Soal"
                                        >
                                            <ListOrdered className="h-4 w-4" />
                                        </button>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            quiz.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {quiz.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(quiz)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quiz)}
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
                                    {editingQuiz ? 'Edit Quiz' : 'Tambah Quiz'}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul Quiz
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Masukkan judul quiz"
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
                                        placeholder="Masukkan deskripsi quiz"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value))}
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Score
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Passing Score
                                        </label>
                                        <Input
                                            type="number"
                                            value={passingScore}
                                            onChange={(e) => setPassingScore(parseInt(e.target.value))}
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value={1}>Aktif</option>
                                            <option value={0}>Nonaktif</option>
                                        </select>
                                    </div>
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
                                            min={getTodayString()}
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
                                            min={startDate || getTodayString()}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tampilkan Nilai
                                        </label>
                                        <div className="flex h-10 items-center">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={showResults === 1}
                                                    onChange={(e) => setShowResults(e.target.checked ? 1 : 0)}
                                                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Tampilkan Nilai ke Siswa</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Menyimpan...' : (editingQuiz ? 'Simpan' : 'Tambah')}
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
