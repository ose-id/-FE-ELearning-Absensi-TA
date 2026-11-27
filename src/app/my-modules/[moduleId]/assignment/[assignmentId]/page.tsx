'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import {
    ArrowLeft,
    Loader2,
    Calendar,
    Award,
    Upload,
    FileText,
    MessageSquare,
    AlertCircle,
    File,
    X
} from 'lucide-react'

import { assignmentService } from '@/services/assignment.service'
import { learningModuleService } from '@/services/learning-module.service'
import { Assignment, AssignmentSubmission } from '@/types/assignment'

export default function StudentAssignmentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()

    const moduleId = parseInt(params.moduleId as string, 10)
    const assignmentId = parseInt(params.assignmentId as string, 10)

    const [assignment, setAssignment] = useState<Assignment | null>(null)
    const [moduleName, setModuleName] = useState<string>('')
    const [submission, setSubmission] = useState<AssignmentSubmission | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Form states
    const [content, setContent] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const fetchData = useCallback(async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const token = session.accessToken

            // Fetch assignment
            const assignmentData = await assignmentService.getAssignmentById(assignmentId, token)
            setAssignment(assignmentData)

            // Fetch module name
            const moduleData = await learningModuleService.getLearningModuleById(moduleId, token)
            if (moduleData) {
                setModuleName(moduleData.vname)
            }

            // Fetch my submission
            const submissionData = await assignmentService.getMySubmission(assignmentId, token)
            setSubmission(submissionData)

            if (submissionData) {
                setContent(submissionData.vcontent || '')
            }
        } catch (error) {
            console.error('Failed to fetch assignment details:', error)
            toast.error(error instanceof Error ? error.message : 'Gagal memuat detail tugas')
        } finally {
            setLoading(false)
        }
    }, [session?.accessToken, assignmentId, moduleId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const allowedExtensions = ['pdf', 'doc', 'docx']
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
            
            if (!allowedExtensions.includes(fileExtension)) {
                toast.error('Hanya berkas PDF atau Word (.doc, .docx) yang diperbolehkan!')
                e.target.value = ''
                return
            }
            setSelectedFile(file)
        }
    }

    const removeSelectedFile = () => {
        setSelectedFile(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.accessToken || !assignment) return

        try {
            setSubmitting(true)

            // Mock File Upload Path
            let mockFilePath = submission?.vfile_path || ''
            let mockFileName = submission?.vfile_name || ''

            if (selectedFile) {
                mockFilePath = `/uploads/submissions/${Date.now()}_${selectedFile.name}`
                mockFileName = selectedFile.name
            }

            await assignmentService.submitAssignment({
                assignment_id: assignment.id,
                content: content.trim() || undefined,
                filePath: mockFilePath || undefined,
                fileName: mockFileName || undefined
            }, session.accessToken)

            toast.success('Tugas berhasil dikumpulkan!')
            setIsEditing(false)
            setSelectedFile(null)
            
            // Reload submission state
            const submissionData = await assignmentService.getMySubmission(assignment.id, session.accessToken)
            setSubmission(submissionData)
        } catch (error) {
            console.error('Submission failed:', error)
            toast.error(error instanceof Error ? error.message : 'Gagal mengumpulkan tugas')
        } finally {
            setSubmitting(false)
        }
    }

    // Format date string to Indonesian format
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Check if the assignment is overdue
    const isOverdue = assignment?.due_date ? new Date() > new Date(assignment.due_date) : false

    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm font-medium text-gray-500">Memuat detail tugas...</p>
                </div>
            </div>
        )
    }

    if (!assignment) {
        return (
            <div className="mx-auto max-w-4xl p-6 text-center space-y-4">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-900">Tugas Tidak Ditemukan</h1>
                <p className="text-gray-500">Tugas yang Anda cari tidak ada atau Anda tidak memiliki akses.</p>
                <button
                    onClick={() => router.push(`/my-modules/${moduleId}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Modul
                </button>
            </div>
        )
    }

    const hasSubmitted = !!submission
    const isGraded = hasSubmitted && submission.vmodi && submission.vmodi !== submission.vcrea

    return (
        <div className="w-full space-y-6">
            {/* Header / Breadcrumb navigation */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push(`/my-modules/${moduleId}`)}
                    className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all shadow-sm group"
                    title="Kembali ke Modul"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 line-clamp-1">{assignment.title}</h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {moduleName} &bull; Tugas
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Assignment details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Instruksi Tugas</h2>
                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                    {assignment.description || 'Tidak ada deskripsi atau instruksi tambahan.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="p-2.5 bg-blue-100/60 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tenggat Waktu</p>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                            {formatDate(assignment.due_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="p-2.5 bg-emerald-100/60 rounded-lg">
                                        <Award className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nilai Maksimal</p>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                            {assignment.max_score} Poin
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Submission Status & Action */}
                <div className="space-y-6">
                    {/* Submission status panel */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Status Pengumpulan</h2>

                        {/* Status Badges */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Status Tugas</span>
                                {hasSubmitted ? (
                                    isGraded ? (
                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                            Sudah Dinilai
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                            Dikumpulkan
                                        </span>
                                    )
                                ) : (
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                                        Belum Dikumpulkan
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Tanggal Pengumpulan</span>
                                <span className="text-gray-800 font-medium text-xs">
                                    {hasSubmitted ? formatDate(submission.dsubmitted_at) : '-'}
                                </span>
                            </div>

                            {hasSubmitted && submission.nis_late === 1 && (
                                <div className="flex items-center gap-1.5 p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>Dikumpulkan terlambat</span>
                                </div>
                            )}

                            {isOverdue && !hasSubmitted && (
                                <div className="flex items-center gap-1.5 p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">
                                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                                    <span>Tugas melewati batas tenggat waktu!</span>
                                </div>
                            )}
                        </div>

                        {/* Grading info (If graded) */}
                        {isGraded && (
                            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                        <Award className="h-4.5 w-4.5" />
                                        <span>Nilai Diperoleh</span>
                                    </div>
                                    <span className="text-xl font-extrabold text-emerald-700">
                                        {submission.nscore} <span className="text-xs font-semibold text-emerald-500">/ {assignment.max_score}</span>
                                    </span>
                                </div>
                                {submission.vfeedback && (
                                    <div className="pt-2 border-t border-emerald-100">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Catatan Guru</p>
                                        <p className="text-xs text-gray-700 italic bg-white p-2.5 rounded-lg border border-emerald-100/50 leading-relaxed">
                                            &ldquo;{submission.vfeedback}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* submission details (If submitted but not graded, or edit modes) */}
                        {hasSubmitted && !isEditing && (
                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                {submission.vcontent && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" /> Jawaban Teks
                                        </span>
                                        <p className="text-xs text-gray-700 bg-gray-50 border border-gray-200/60 p-3 rounded-lg max-h-40 overflow-y-auto whitespace-pre-line leading-relaxed">
                                            {submission.vcontent}
                                        </p>
                                    </div>
                                )}

                                {submission.vfile_name && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <FileText className="h-3 w-3" /> Lampiran File
                                        </span>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200/60 rounded-lg">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <File className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                                                <span className="text-xs font-medium text-gray-800 truncate" title={submission.vfile_name}>
                                                    {submission.vfile_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Show edit submit button if not graded yet */}
                                {!isGraded && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        Edit Pengumpulan
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Submission Form (Not submitted yet OR editing mode) */}
                        {(!hasSubmitted || isEditing) && (
                            <form onSubmit={handleSubmit} className="pt-4 border-t border-gray-100 space-y-4">
                                {/* Text area for content */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700">Jawaban / Catatan</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Ketik tautan link atau catatan tugas Anda di sini..."
                                        rows={4}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 focus:outline-none transition-all resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Simulated File Upload */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700">Lampiran File (Opsional)</label>
                                    {selectedFile ? (
                                        <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <File className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                                                <span className="text-xs font-medium text-blue-900 truncate" title={selectedFile.name}>
                                                    {selectedFile.name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeSelectedFile}
                                                className="p-1 hover:bg-blue-100 rounded text-blue-600 shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                            className="border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 p-4 rounded-xl text-center cursor-pointer transition-all duration-200 group"
                                        >
                                            <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                                            <p className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">Klik untuk upload file</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Hanya PDF atau Word (.doc, .docx)</p>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Form Action buttons */}
                                <div className="space-y-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Mengirim...</span>
                                            </>
                                        ) : (
                                            <span>Kirim Tugas</span>
                                        )}
                                    </button>

                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false)
                                                setContent(submission?.vcontent || '')
                                                setSelectedFile(null)
                                            }}
                                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                                        >
                                            Batal
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
