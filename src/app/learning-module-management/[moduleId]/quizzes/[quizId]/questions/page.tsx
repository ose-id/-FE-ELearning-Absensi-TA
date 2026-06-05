'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search, Loader2, FileQuestion, Edit, Trash2, X, Download, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { quizService } from '@/services/quiz.service'
import { questionBankService } from '@/services/question-bank.service'
import { Quiz, QuizQuestion } from '@/types/quiz'
import { QuestionBank } from '@/types/question-bank'

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

export default function QuizQuestionsPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)
    const quizId = parseInt(params.quizId as string)

    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [questionText, setQuestionText] = useState('')
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false' | 'essay'>('multiple_choice')
    const [points, setPoints] = useState(10)
    const [answerKey, setAnswerKey] = useState('')
    const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' })

    // Import state
    const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([])
    const [importLoading, setImportLoading] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])

    useEffect(() => {
        if (session?.accessToken) {
            fetchQuiz()
            fetchQuestions()
        }
    }, [session?.accessToken, moduleId, quizId])

    const fetchQuiz = async () => {
        if (!session?.accessToken) return
        try {
            const response = await quizService.getQuizById(quizId, session.accessToken)
            setQuiz(response)
        } catch (error) {
            console.error('Failed to fetch quiz:', error)
        }
    }

    const fetchQuestions = async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await quizService.getQuestions(quizId, session.accessToken)
            setQuestions(response.data)
        } catch (error) {
            console.error('Failed to fetch questions:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchQuestionBanks = async () => {
        if (!session?.accessToken) return
        try {
            setImportLoading(true)
            const teacherId = parseInt(session.user?.id || '0')
            const response = await questionBankService.getQuestionBanks(
                session.accessToken,
                1,
                100,
                undefined,
                teacherId
            )
            setQuestionBanks(response.data)
        } catch (error) {
            console.error('Failed to fetch question banks:', error)
        } finally {
            setImportLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingQuestion(null)
        setQuestionText('')
        setQuestionType('multiple_choice')
        setPoints(10)
        setAnswerKey('')
        setOptions({ A: '', B: '', C: '', D: '' })
        setIsFormOpen(true)
    }

    const handleEdit = (question: QuizQuestion) => {
        setEditingQuestion(question)
        setQuestionText(question.vquestion)
        setQuestionType(question.vtype as 'multiple_choice' | 'true_false' | 'essay')
        setPoints(question.npoints)
        setAnswerKey(question.vanswer_key || '')

        // Parse options if exists
        if (question.voptions) {
            try {
                const parsed = JSON.parse(question.voptions)
                setOptions({
                    A: parsed.A || '',
                    B: parsed.B || '',
                    C: parsed.C || '',
                    D: parsed.D || ''
                })
            } catch {
                setOptions({ A: '', B: '', C: '', D: '' })
            }
        } else {
            setOptions({ A: '', B: '', C: '', D: '' })
        }
        setIsFormOpen(true)
    }

    const handleDelete = async (question: QuizQuestion) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus soal ini?`)) return
        if (!session?.accessToken) return

        try {
            await quizService.deleteQuestion(question.nid, session.accessToken)
            toast.success('Soal berhasil dihapus')
            fetchQuestions()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menghapus soal'))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            const questionData: any = {
                QuizId: quizId,
                Order: editingQuestion ? editingQuestion.norder : questions.length + 1,
                Question: questionText,
                Type: questionType,
                Points: points,
            }

            if (questionType !== 'essay') {
                questionData.AnswerKey = answerKey
            }

            if (questionType === 'multiple_choice') {
                questionData.Options = JSON.stringify(options)
            } else if (questionType === 'true_false') {
                questionData.Options = JSON.stringify({ true_text: 'Benar', false_text: 'Salah' })
            }

            if (editingQuestion) {
                await quizService.updateQuestion(
                    editingQuestion.nid,
                    {
                        Order: questionData.Order,
                        Question: questionData.Question,
                        Type: questionData.Type,
                        Points: questionData.Points,
                        AnswerKey: questionData.AnswerKey,
                        Options: questionData.Options,
                    },
                    session.accessToken
                )
                toast.success('Soal berhasil diperbarui')
            } else {
                await quizService.createQuestion(questionData, session.accessToken)
                toast.success('Soal berhasil dibuat')
            }

            setIsFormOpen(false)
            fetchQuestions()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menyimpan soal'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImport = async () => {
        if (selectedQuestions.length === 0) {
            toast.error('Pilih至少 satu soal untuk diimport')
            return
        }
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            for (const bankId of selectedQuestions) {
                const bank = questionBanks.find(q => q.nid === bankId)
                if (!bank) continue

                const questionData: any = {
                    QuizId: quizId,
                    Order: questions.length + 1,
                    Question: bank.vquestion,
                    Type: bank.vtype as 'multiple_choice' | 'true_false' | 'essay',
                    Points: bank.npoints,
                }

                if (bank.vtype !== 'essay') {
                    questionData.AnswerKey = bank.vcorrect_answer
                    if (bank.voptions) {
                        try {
                            const parsed = JSON.parse(bank.voptions)
                            questionData.Options = JSON.stringify({
                                A: parsed.A || '',
                                B: parsed.B || '',
                                C: parsed.C || '',
                                D: parsed.D || ''
                            })
                        } catch {
                            questionData.Options = bank.voptions
                        }
                    }
                }

                await quizService.createQuestion(questionData, session.accessToken)
            }

            toast.success(`${selectedQuestions.length} soal berhasil diimport`)
            setIsImportOpen(false)
            setSelectedQuestions([])
            fetchQuestions()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal mengimport soal'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleSelectQuestion = (id: number) => {
        setSelectedQuestions(prev =>
            prev.includes(id)
                ? prev.filter(q => q !== id)
                : [...prev, id]
        )
    }

    const filteredQuestions = questions.filter(q =>
        q.vquestion?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredBanks = questionBanks.filter(q =>
        q.vquestion?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/learning-module-management/${moduleId}/quizzes`)}
                            className="p-2 hover:bg-white rounded-lg border border-gray-200"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Kelola Soal Quiz - {quiz?.vtitle || 'Loading...'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Tambah dan kelola soal untuk quiz ini
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => { fetchQuestionBanks(); setIsImportOpen(true); setSearchTerm('') }} variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Import dari Bank Soal
                        </Button>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Soal
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <Input
                            className="flex-1 border-none bg-transparent focus-visible:ring-0"
                            placeholder="Cari soal..."
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

                {/* Questions List */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-12">
                            <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada soal</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Soal
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredQuestions.map((question, index) => (
                                <div
                                    key={question.nid}
                                    className="flex items-start justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-medium text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="max-w-2xl">
                                            <p className="font-medium text-gray-900">{question.vquestion}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    question.vtype === 'multiple_choice' ? 'bg-blue-100 text-blue-700' :
                                                    question.vtype === 'true_false' ? 'bg-green-100 text-green-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {question.vtype === 'multiple_choice' ? 'Pilihan Ganda' :
                                                     question.vtype === 'true_false' ? 'Ben/Salah' : 'Essay'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {question.npoints} poin
                                                </span>
                                                {question.vanswer_key && (
                                                    <span className="text-xs text-gray-500">
                                                        Jawaban: {question.vanswer_key}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(question)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(question)}
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

                {/* Total Points */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Poin:</span>
                        <span className="text-xl font-bold text-gray-900">
                            {questions.reduce((sum, q) => sum + q.npoints, 0)}
                        </span>
                    </div>
                </div>

                {/* Add/Edit Question Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    {editingQuestion ? 'Edit Soal' : 'Tambah Soal'}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pertanyaan
                                    </label>
                                    <textarea
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        placeholder="Masukkan pertanyaan"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipe soal
                                        </label>
                                        <select
                                            value={questionType}
                                            onChange={(e) => setQuestionType(e.target.value as any)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="multiple_choice">Pilihan Ganda</option>
                                            <option value="true_false">Benar/Salah</option>
                                            <option value="essay">Essay</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Poin
                                        </label>
                                        <Input
                                            type="number"
                                            value={points}
                                            onChange={(e) => setPoints(parseInt(e.target.value))}
                                            min={1}
                                            required
                                        />
                                    </div>
                                </div>

                                {questionType === 'multiple_choice' && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Opsi Jawaban</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                <div key={opt} className="flex items-center gap-2">
                                                    <span className="w-6 text-sm font-medium text-gray-600">{opt}.</span>
                                                    <Input
                                                        value={options[opt as keyof typeof options]}
                                                        onChange={(e) => setOptions({ ...options, [opt]: e.target.value })}
                                                        placeholder={`Opsi ${opt}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Jawaban Benar
                                            </label>
                                            <select
                                                value={answerKey}
                                                onChange={(e) => setAnswerKey(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                required
                                            >
                                                <option value="">Pilih jawaban benar</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {questionType === 'true_false' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Jawaban Benar
                                        </label>
                                        <select
                                            value={answerKey}
                                            onChange={(e) => setAnswerKey(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        >
                                            <option value="">Pilih jawaban benar</option>
                                            <option value="True">Benar</option>
                                            <option value="False">Salah</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Menyimpan...' : (editingQuestion ? 'Simpan' : 'Tambah')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {isImportOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Import dari Bank Soal</h2>
                                <button onClick={() => setIsImportOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-gray-500" />
                                    <Input
                                        className="flex-1 border-none bg-transparent focus-visible:ring-0"
                                        placeholder="Cari di bank soal..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {importLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : filteredBanks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                    <p>Tidak ada soal di bank soal</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {filteredBanks.map((bank) => (
                                        <div
                                            key={bank.nid}
                                            onClick={() => toggleSelectQuestion(bank.nid)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                selectedQuestions.includes(bank.nid)
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 p-1 rounded ${
                                                    selectedQuestions.includes(bank.nid)
                                                        ? 'bg-purple-500 text-white'
                                                        : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                    {selectedQuestions.includes(bank.nid) && (
                                                        <Check className="h-3 w-3" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{bank.vquestion}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                            {bank.vtype}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {bank.npoints} poin
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <span className="text-sm text-gray-500">
                                    {selectedQuestions.length} soal dipilih
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={selectedQuestions.length === 0 || isSubmitting}
                                    >
                                        {isSubmitting ? 'Mengimport...' : `Import ${selectedQuestions.length} Soal`}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
