'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { Plus, Search, Loader2, FolderOpen, Edit, Trash2, X, ArrowLeft, HelpCircle, ClipboardList, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/button'
import { ROLES } from '@/config/roles'
import Input from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import Dialog from '@/components/ui/dialog'
import DialogContent from '@/components/ui/dialog/dialog-content'
import DialogHeader from '@/components/ui/dialog/dialog-header'
import DialogTitle from '@/components/ui/dialog/dialog-title'
import DialogFooter from '@/components/ui/dialog/dialog-footer'
import DialogDescription from '@/components/ui/dialog/dialog-description'

import { questionBankService } from '@/services/question-bank.service'
import { QuestionBank } from '@/types/question-bank'

function QuestionBankContent() {
    const { data: session } = useSession()
    const [questions, setQuestions] = useState<QuestionBank[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionBank | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        question: '',
        type: 'multiple_choice',
        options: '',
        answerKey: '',
        points: 10,
    })

    const fetchQuestions = async () => {
        if (!session?.accessToken) return
        setLoading(true)
        try {
            const response = await questionBankService.getQuestionBanks(session.accessToken, 1, 100, searchTerm)
            setQuestions(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch questions:', error)
            const message = error instanceof Error ? error.message : 'Gagal memuat question bank'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchQuestions()
        }
    }, [session, searchTerm])

    const handleOpenForm = (question?: QuestionBank) => {
        if (question) {
            setSelectedQuestion(question)
            // Parse joptions format (A, B, C, D)
            let options = ''
            try {
                if (question.voptions) {
                    const opts = JSON.parse(question.voptions)
                    if (opts.A || opts.B || opts.C || opts.D) {
                        options = [opts.A, opts.B, opts.C, opts.D].filter(Boolean).join('\n')
                    }
                }
            } catch {}

            // Convert letter answer (A, B, C, D) to number (1, 2, 3, 4)
            let answerKey = ''
            if (question.vcorrect_answer) {
                const answerMap: Record<string, string> = { 'A': '1', 'B': '2', 'C': '3', 'D': '4' }
                answerKey = answerMap[question.vcorrect_answer] || question.vcorrect_answer
            }

            setFormData({
                question: question.vquestion || '',
                type: question.vtype || 'multiple_choice',
                options: options,
                answerKey: answerKey,
                points: question.npoints || 10,
            })
        } else {
            setSelectedQuestion(null)
            setFormData({
                question: '',
                type: 'multiple_choice',
                options: '',
                answerKey: '',
                points: 10,
            })
        }
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setSelectedQuestion(null)
    }

    const handleSubmit = async () => {
        if (!session?.accessToken) return
        if (!formData.question.trim()) {
            toast.error('Pertanyaan wajib diisi')
            return
        }

        setIsSubmitting(true)
        try {
            // Convert options to joptions format for backend
            let joptions: { A?: string; B?: string; C?: string; D?: string } | undefined
            if (formData.type === 'multiple_choice' && formData.options.trim()) {
                const opts = formData.options.split('\n').filter(o => o.trim())
                joptions = {
                    A: opts[0]?.trim(),
                    B: opts[1]?.trim(),
                    C: opts[2]?.trim(),
                    D: opts[3]?.trim(),
                }
            }

            // Map answer key (1=A, 2=B, 3=C, 4=D) to actual letter
            let vcorrect_answer: string | undefined
            if (formData.answerKey && formData.type === 'multiple_choice') {
                const answerMap: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' }
                vcorrect_answer = answerMap[formData.answerKey]
            } else if (formData.answerKey && formData.type === 'true_false') {
                vcorrect_answer = formData.answerKey
            }

            if (selectedQuestion) {
                await questionBankService.updateQuestionBank(selectedQuestion.nid, {
                    vquestion: formData.question,
                    vtype: formData.type,
                    joptions: joptions,
                    vcorrect_answer: vcorrect_answer,
                    npoints: formData.points,
                }, session.accessToken)
                toast.success('Pertanyaan berhasil diperbarui')
            } else {
                await questionBankService.createQuestionBank({
                    vsubject: 'General', // Default subject
                    vquestion: formData.question,
                    vtype: formData.type,
                    joptions: joptions,
                    vcorrect_answer: vcorrect_answer,
                    npoints: formData.points,
                    nstatus: 1,
                }, session.accessToken)
                toast.success('Pertanyaan berhasil ditambahkan')
            }
            handleCloseForm()
            fetchQuestions()
        } catch (error: unknown) {
            console.error(error)
            const message = error instanceof Error ? error.message : 'Gagal menyimpan pertanyaan'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (question: QuestionBank) => {
        if (!confirm(`Hapus pertanyaan ini?`)) return
        if (!session?.accessToken) return

        try {
            await questionBankService.deleteQuestionBank(question.nid, session.accessToken)
            toast.success('Pertanyaan dihapus')
            fetchQuestions()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal menghapus'
            toast.error(message)
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice': return 'Pilihan Ganda'
            case 'essay': return 'Essay'
            case 'true_false': return 'Benar/Salah'
            default: return type
        }
    }

    const stats = [
        { label: 'Total Soal', value: questions.length, icon: HelpCircle, colorClass: 'bg-blue-500', bgClass: 'bg-blue-50', iconClass: 'text-blue-600' },
        { label: 'Pilihan Ganda', value: questions.filter(q => q.vtype === 'multiple_choice').length, icon: ClipboardList, colorClass: 'bg-purple-500', bgClass: 'bg-purple-50', iconClass: 'text-purple-600' },
        { label: 'Essay', value: questions.filter(q => q.vtype === 'essay').length, icon: FileText, colorClass: 'bg-green-500', bgClass: 'bg-green-50', iconClass: 'text-green-600' },
        { label: 'Benar/Salah', value: questions.filter(q => q.vtype === 'true_false').length, icon: CheckCircle2, colorClass: 'bg-orange-500', bgClass: 'bg-orange-50', iconClass: 'text-orange-600' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-6 px-4">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Question Bank
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola bank soal untuk Quiz dan Ujian
                        </p>
                    </div>
                    <Button onClick={() => handleOpenForm()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pertanyaan
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {stats.map((item, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className={`absolute top-0 left-0 right-0 h-1 ${item.colorClass}`} />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{item.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                                </div>
                                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${item.bgClass}`}>
                                    <item.icon className={`h-7 w-7 ${item.iconClass}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="border-b border-gray-200 p-6 bg-white">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-1">
                                <Search className="h-5 w-5 text-gray-500" />
                                <Input
                                    className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                                    placeholder="Cari pertanyaan..."
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
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{questions.length}</span> questions
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="p-0 overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-12 px-6">
                                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum Ada Soal</h3>
                                <p className="text-sm text-gray-500 mb-6">Mulai tambahkan koleksi soal untuk quiz pembelajaran.</p>
                                <Button onClick={() => handleOpenForm()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Pertanyaan Pertama
                                </Button>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pertanyaan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Poin</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {questions.map((q) => (
                                        <tr key={q.nid} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1 max-w-2xl">
                                                    <p className="text-gray-900 font-medium leading-relaxed line-clamp-2 group-hover:text-blue-700 transition-colors">
                                                        {q.vquestion}
                                                    </p>
                                                    {q.vanswer_key && (
                                                        <span className="text-[10px] font-bold text-green-600 uppercase">Kunci: {q.vanswer_key}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                    q.vtype === 'multiple_choice' ? 'bg-blue-100 text-blue-700' :
                                                    q.vtype === 'essay' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {getTypeLabel(q.vtype || '')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center justify-center h-8 w-12 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold">
                                                    {q.npoints}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleOpenForm(q)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                                        title="Edit Soal"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(q)}
                                                        className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                                        title="Hapus Soal"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Form Dialog */}
                <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
                    <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-6 bg-white border-none pb-2">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {selectedQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500">
                                Lengkapi detail pertanyaan di bawah ini untuk disimpan ke bank soal.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Tipe Pertanyaan</label>
                                    <Select 
                                        value={formData.type} 
                                        onValueChange={(v: string) => setFormData({ 
                                            ...formData, 
                                            type: v, 
                                            answerKey: v === 'true_false' ? 'true' : '',
                                            options: v === 'multiple_choice' ? 'Opsi A\nOpsi B\nOpsi C\nOpsi D' : ''
                                        })}
                                    >
                                        <SelectTrigger className="h-10 border-gray-200">
                                            <SelectValue>
                                                {formData.type === 'multiple_choice' ? 'Pilihan Ganda' : 
                                                 formData.type === 'essay' ? 'Essay' : 
                                                 formData.type === 'true_false' ? 'Benar atau Salah' : 'Pilih Tipe'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="multiple_choice">Pilihan Ganda</SelectItem>
                                            <SelectItem value="essay">Essay</SelectItem>
                                            <SelectItem value="true_false">Benar atau Salah</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Bobot Poin</label>
                                    <Input
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                                        className="h-10 border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Isi Pertanyaan</label>
                                <textarea
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm min-h-[80px]"
                                    placeholder="Tuliskan pertanyaan di sini..."
                                />
                            </div>

                            {formData.type === 'multiple_choice' && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Opsi Jawaban</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['A', 'B', 'C', 'D'].map((label, idx) => {
                                            const opts = formData.options.split('\n')
                                            return (
                                                <div key={label} className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                                                        {label}
                                                    </div>
                                                    <Input
                                                        value={opts[idx] || ''}
                                                        onChange={(e) => {
                                                            const newOpts = [...opts]
                                                            newOpts[idx] = e.target.value
                                                            setFormData({ ...formData, options: newOpts.join('\n') })
                                                        }}
                                                        className="h-9 border-gray-200"
                                                        placeholder={`Jawaban ${label}...`}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {formData.type !== 'essay' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Kunci Jawaban</label>
                                    {formData.type === 'multiple_choice' ? (
                                        <div className="flex flex-wrap gap-2">
                                            {['A', 'B', 'C', 'D'].map((label, idx) => (
                                                <button
                                                    key={label}
                                                    onClick={() => setFormData({ ...formData, answerKey: (idx + 1).toString() })}
                                                    className={`h-10 w-24 rounded-lg text-sm font-bold border transition-all ${formData.answerKey === (idx + 1).toString() ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    OPSI {label}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setFormData({ ...formData, answerKey: 'true' })}
                                                className={`h-10 rounded-lg text-sm font-bold border transition-all ${formData.answerKey === 'true' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                BENAR
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, answerKey: 'false' })}
                                                className={`h-10 rounded-lg text-sm font-bold border transition-all ${formData.answerKey === 'false' ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                SALAH
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="p-6 bg-white border-none flex items-center justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={handleCloseForm} className="h-10 px-6 border-gray-200 text-gray-600 hover:bg-gray-50">
                                Batal
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="h-10 px-8 bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {selectedQuestion ? 'Simpan' : 'Tambah'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default function QuestionBankPage() {
    return (
        <DashboardLayout allowedRoles={[ROLES.TEACHER]}>
            <QuestionBankContent />
        </DashboardLayout>
    )
}
