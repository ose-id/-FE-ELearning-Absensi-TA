'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Send, BookOpen, Timer, Trophy, ShieldAlert, Monitor } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import { examService } from '@/services/exam.service'
import { Exam, ExamQuestion } from '@/types/exam'

type ExamPhase = 'intro' | 'taking' | 'result'

interface ExamOptionData {
    A?: string
    B?: string
    C?: string
    D?: string
    true_text?: string
    false_text?: string
    guide?: string
}

interface ExamResult {
    score: number
    totalPoints: number
    percentage: number
    correctCount: number
    totalQuestions: number
    passed: boolean
}

// ─── Countdown Timer Hook (with Cutoff support) ───
function useCountdown(
    endTime: Date | null,
    cutoffTime: Date | null,
    enableCutoff: boolean,
    isRunning: boolean,
    onExpire: () => void
) {
    const [now, setNow] = useState(new Date())
    const onExpireRef = useRef(onExpire)

    useEffect(() => {
        onExpireRef.current = onExpire
    })

    useEffect(() => {
        if (!isRunning) return

        const timeoutId = setTimeout(() => {
            setNow(new Date())
        }, 0)

        const id = setInterval(() => {
            const current = new Date()
            setNow(current)

            // Cutoff check: if current time is past cutoffTime and cutoff is enabled, force submit
            if (enableCutoff && cutoffTime && current >= cutoffTime) {
                clearInterval(id)
                onExpireRef.current()
            }
        }, 1000)

        return () => {
            clearTimeout(timeoutId)
            clearInterval(id)
        }
    }, [isRunning, cutoffTime, enableCutoff])

    const secondsLeft = useMemo(() => {
        if (!endTime) return 0
        
        let target = endTime.getTime()
        if (enableCutoff && cutoffTime) {
            target = Math.min(target, cutoffTime.getTime())
        }

        const diff = Math.floor((target - now.getTime()) / 1000)
        return Math.max(0, diff)
    }, [endTime, cutoffTime, enableCutoff, now])

    useEffect(() => {
        if (isRunning && endTime && secondsLeft <= 0) {
            onExpireRef.current()
        }
    }, [secondsLeft, isRunning, endTime])

    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    const urgency = secondsLeft <= 60 ? 'critical' : secondsLeft <= 300 ? 'warning' : 'normal'

    return { secondsLeft, formatted, urgency }
}

export default function StudentExamPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)
    const examId = parseInt(params.examId as string)

    const [phase, setPhase] = useState<ExamPhase>('intro')
    const [exam, setExam] = useState<Exam | null>(null)
    const [questions, setQuestions] = useState<ExamQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<ExamResult | null>(null)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

    // Anti-cheat Fullscreen states
    const [violations, setViolations] = useState(0)
    const [showCheatModal, setShowCheatModal] = useState(false)
    const isFullscreenRequired = exam?.nfullscreen === 1

    // Fetch exam and questions
    useEffect(() => {
        if (!session?.accessToken) return
        const token = session.accessToken

        const fetchData = async () => {
            try {
                const studentId = session?.user?.id ? parseInt(session.user.id, 10) : 0
                const [examRes, questionsRes, myAttempt] = await Promise.all([
                    examService.getExamById(examId, token),
                    examService.getExamQuestions(examId, token),
                    examService.getMyExamAttempt(examId, token),
                ])

                setExam(examRes)

                // Sort questions by order
                const sorted = (questionsRes.data || []).sort((a: ExamQuestion, b: ExamQuestion) => a.norder - b.norder)
                setQuestions(sorted)

                if (myAttempt && examRes) {
                    const score = myAttempt.nscore ?? 0
                    const maxScore = sorted.reduce((sum, q) => sum + q.npoints, 0) || 100
                    const pct = myAttempt.npercentage ?? (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0)
                    const passingGrade = examRes.npass_grade || 70

                    setResult({
                        score,
                        totalPoints: maxScore,
                        percentage: pct,
                        correctCount: Math.round((pct / 100) * sorted.length),
                        totalQuestions: sorted.length,
                        passed: pct >= passingGrade
                    })
                    setPhase('result')
                } else if (typeof window !== 'undefined') {
                    // Load saved progress from localStorage
                    const savedPhase = localStorage.getItem(`elearn_exam_phase_${examId}`)
                    const savedStartTime = localStorage.getItem(`elearn_exam_start_time_${examId}`)
                    const savedAnswers = localStorage.getItem(`elearn_exam_answers_${examId}`)
                    const savedViolations = localStorage.getItem(`elearn_exam_violations_${examId}`)

                    if (savedAnswers) {
                        try {
                            setAnswers(JSON.parse(savedAnswers))
                        } catch (e) {
                            console.error('Failed to parse saved answers:', e)
                        }
                    }

                    if (savedViolations) {
                        setViolations(parseInt(savedViolations, 10) || 0)
                    }

                    if (savedPhase === 'taking' && savedStartTime && examRes) {
                        const originalStart = new Date(savedStartTime)
                        const elapsed = Math.floor((new Date().getTime() - originalStart.getTime()) / 1000)
                        const durationInSeconds = examRes.nduration * 60
                        const remaining = durationInSeconds - elapsed

                        if (remaining > 0) {
                            setStartTime(originalStart)
                            setPhase('taking')
                        } else {
                            // Expired, clear storage
                            localStorage.removeItem(`elearn_exam_phase_${examId}`)
                            localStorage.removeItem(`elearn_exam_start_time_${examId}`)
                            localStorage.removeItem(`elearn_exam_answers_${examId}`)
                            localStorage.removeItem(`elearn_exam_violations_${examId}`)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch exam data:', error)
                toast.error('Gagal memuat data ujian')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [session?.accessToken, session?.user?.id, examId])

    // ─── Fullscreen & Focus Control ───
    const requestFullscreen = useCallback(async () => {
        try {
            const docEl = document.documentElement
            if (docEl.requestFullscreen) {
                await docEl.requestFullscreen()
            }
            setShowCheatModal(false)
        } catch (err) {
            console.error('Error enabling fullscreen:', err)
            toast.error('Gagal masuk ke mode layar penuh. Pastikan browser memberikan izin.')
        }
    }, [])

    const handleFullscreenChange = useCallback(() => {
        if (!document.fullscreenElement && phase === 'taking' && isFullscreenRequired) {
            setViolations(prev => {
                const next = prev + 1
                localStorage.setItem(`elearn_exam_violations_${examId}`, next.toString())
                return next
            })
            setShowCheatModal(true)
            toast.warning('Peringatan: Anda keluar dari mode layar penuh!')
        }
    }, [phase, isFullscreenRequired, examId])

    const handleVisibilityChange = useCallback(() => {
        if (document.visibilityState === 'hidden' && phase === 'taking') {
            setViolations(prev => {
                const next = prev + 1
                localStorage.setItem(`elearn_exam_violations_${examId}`, next.toString())
                return next
            })
            if (isFullscreenRequired) {
                setShowCheatModal(true)
            }
            toast.error('Peringatan: Anda keluar dari tab kuis! Pelanggaran dicatat.')
        }
    }, [phase, isFullscreenRequired, examId])

    useEffect(() => {
        if (phase === 'taking') {
            document.addEventListener('fullscreenchange', handleFullscreenChange)
            document.addEventListener('visibilitychange', handleVisibilityChange)
        }
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [phase, handleFullscreenChange, handleVisibilityChange])

    // ─── Scoring Logic ───
    const calculateResult = useCallback((): ExamResult => {
        let correctCount = 0
        let score = 0
        let totalPoints = 0

        questions.forEach(q => {
            totalPoints += q.npoints
            const studentAnswer = answers[q.nid]?.trim().toLowerCase() || ''
            const correctAnswer = (q.vanswer_key || '').trim().toLowerCase()

            if (q.vtype === 'multiple_choice' || q.vtype === 'true_false') {
                const s = studentAnswer
                const c = correctAnswer
                
                const mapLetter: Record<string, string> = { 'a': '1', 'b': '2', 'c': '3', 'd': '4' }
                const mappedS = mapLetter[s] || s
                const mappedC = mapLetter[c] || c
                
                if (mappedS === mappedC || s === c) {
                    correctCount++
                    score += q.npoints
                }
            } else if (q.vtype === 'essay') {
                // Essay logic: if there is an answer, award full points as placeholder (teachers grade manually later)
                if (studentAnswer.length > 0) {
                    correctCount++
                    score += q.npoints
                }
            }
        })

        const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
        const passingGrade = exam?.npass_grade || 70
        return { score, totalPoints, percentage, correctCount, totalQuestions: questions.length, passed: percentage >= passingGrade }
    }, [answers, questions, exam])

    // ─── Submit Handler ───
    const handleSubmit = useCallback(async () => {
        if (!session?.accessToken || !exam || isSubmitting) return
        setIsSubmitting(true)
        setShowConfirmSubmit(false)

        try {
            // Exit fullscreen if active
            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(() => {})
            }

            const examResult = calculateResult()
            const finishTime = new Date()

            // Prepare answers JSON
            const answersJson = JSON.stringify(answers)

            await examService.submitExamAttempt(examId, {
                StartAt: startTime?.toISOString() || finishTime.toISOString(),
                FinishAt: finishTime.toISOString(),
                Score: examResult.score,
                Percentage: examResult.percentage,
                Answers: answersJson,
                Violations: violations
            }, session.accessToken)

            // Clear saved localStorage progress
            if (typeof window !== 'undefined') {
                localStorage.removeItem(`elearn_exam_phase_${examId}`)
                localStorage.removeItem(`elearn_exam_start_time_${examId}`)
                localStorage.removeItem(`elearn_exam_answers_${examId}`)
                localStorage.removeItem(`elearn_exam_violations_${examId}`)
            }

            setResult(examResult)
            setPhase('result')
            toast.success('Ujian berhasil dikumpulkan!')
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Gagal mengirim ujian'
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }, [session?.accessToken, exam, examId, answers, startTime, calculateResult, violations, isSubmitting])

    // Timer expiry / Cutoff auto-submit
    const handleTimerExpire = useCallback(() => {
        toast.warning('Waktu ujian habis! Jawaban Anda otomatis dikumpulkan.')
        handleSubmit()
    }, [handleSubmit])

    const endTime = useMemo(() => {
        if (!startTime || !exam) return null
        return new Date(startTime.getTime() + exam.nduration * 60 * 1000)
    }, [startTime, exam])

    const cutoffTime = useMemo(() => {
        if (!exam?.dend) return null
        return new Date(exam.dend)
    }, [exam])

    const { formatted: timerFormatted, urgency: timerUrgency } = useCountdown(
        endTime,
        cutoffTime,
        exam?.ncutoff === 1,
        phase === 'taking' && !showCheatModal,
        handleTimerExpire
    )

    // ─── Answer Handler ───
    const setAnswer = (questionId: number, value: string) => {
        setAnswers(prev => {
            const next = { ...prev, [questionId]: value }
            if (typeof window !== 'undefined') {
                localStorage.setItem(`elearn_exam_answers_${examId}`, JSON.stringify(next))
            }
            return next
        })
    }

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

    // ─── Start Exam ───
    const handleStartExam = async () => {
        const start = new Date()
        setStartTime(start)
        setPhase('taking')
        if (typeof window !== 'undefined') {
            localStorage.setItem(`elearn_exam_phase_${examId}`, 'taking')
            localStorage.setItem(`elearn_exam_start_time_${examId}`, start.toISOString())
        }
        
        if (isFullscreenRequired) {
            await requestFullscreen()
        }
    }

    // ─── Parse Options ───
    const parseOptions = (q: ExamQuestion): ExamOptionData => {
        if (!q.voptions) return {}
        try {
            let parsed: unknown = q.voptions

            if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed)
                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed)
                }
            }

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                const result: ExamOptionData = {}
                const obj = parsed as Record<string, unknown>
                if (obj.A || obj.a) result.A = String(obj.A || obj.a)
                if (obj.B || obj.b) result.B = String(obj.B || obj.b)
                if (obj.C || obj.c) result.C = String(obj.C || obj.c)
                if (obj.D || obj.d) result.D = String(obj.D || obj.d)
                if (obj.true_text) result.true_text = String(obj.true_text)
                if (obj.false_text) result.false_text = String(obj.false_text)
                return result
            }

            if (Array.isArray(parsed)) {
                const result: ExamOptionData = {}
                const keys = ['A', 'B', 'C', 'D'] as const
                ;(parsed as unknown[]).forEach((item: unknown, idx: number) => {
                    if (idx < 4) {
                        const key = keys[idx]
                        if (typeof item === 'string') {
                            result[key] = item
                        } else if (item && typeof item === 'object') {
                            const itemObj = item as Record<string, unknown>
                            const val = itemObj.text || itemObj.value || itemObj.label || Object.values(itemObj)[0]
                            if (val) {
                                result[key] = String(val)
                            }
                        }
                    }
                })
                return result
            }
            
            return {}
        } catch (e) {
            console.error('Failed to parse options:', q.voptions, e)
            return {}
        }
    }

    if (loading) {
        return (
            <div className="py-24 w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-gray-500">Memuat ujian...</p>
                </div>
            </div>
        )
    }

    if (!exam || questions.length === 0) {
        return (
            <div className="py-24 w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto" />
                    <h2 className="text-lg font-bold text-gray-800">Ujian Tidak Tersedia</h2>
                    <p className="text-sm text-gray-500">Ujian ini belum memiliki soal atau tidak ditemukan.</p>
                    <button onClick={() => router.push(`/my-modules/${moduleId}`)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Kembali ke Modul
                    </button>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════
    // PHASE: INTRO
    // ═══════════════════════════════════
    if (phase === 'intro') {
        return (
            <div className="w-full py-4">
                <div className="w-full">
                    <button
                        onClick={() => router.push(`/my-modules/${moduleId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors mb-4 border border-gray-200 bg-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Modul
                    </button>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-800 p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldAlert className="h-5 w-5 opacity-80" />
                                <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Ujian Resmi</span>
                            </div>
                            <h1 className="text-xl font-extrabold tracking-tight">{exam.vtitle}</h1>
                            {exam.vdescription && (
                                <p className="mt-2 text-sm text-white/80 leading-relaxed">{exam.vdescription}</p>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-center">
                                    <Timer className="h-5 w-5 text-red-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">{exam.nduration}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Menit</p>
                                </div>
                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 text-center">
                                    <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">{questions.length}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Soal</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-center">
                                    <Trophy className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">{exam.npass_grade}%</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Nilai KKM</p>
                                </div>
                                <div className="rounded-xl bg-purple-50 border border-purple-100 p-3.5 text-center">
                                    <Monitor className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">
                                        {isFullscreenRequired ? 'Ya' : 'Tidak'}
                                    </p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Fullscreen</p>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                                <div className="flex items-start gap-2.5">
                                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                    <div className="text-xs text-red-800 space-y-1">
                                        <p className="font-bold">PERATURAN UJIAN (PENTING):</p>
                                        <ul className="list-disc list-inside space-y-0.5 text-red-700">
                                            {isFullscreenRequired && (
                                                <li className="font-semibold text-red-900">Ujian ini mewajibkan mode LAYAR PENUH (Fullscreen). Menutup fullscreen akan dicatat sebagai pelanggaran.</li>
                                            )}
                                            <li>Jangan berpindah tab browser atau menutup jendela browser selama ujian berlangsung.</li>
                                            <li>Ujian akan otomatis dikumpulkan jika durasi habis atau melewati tanggal batas selesai kuis.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={handleStartExam}
                                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Mulai Ujian Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════
    // PHASE: RESULT
    // ═══════════════════════════════════
    if (phase === 'result' && result) {
        const canShowScore = exam.nshow_results !== 0

        return (
            <div className="w-full py-4">
                <div className="w-full">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                        {/* Result Header */}
                        <div className={`p-6 text-white ${
                            !canShowScore
                                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700'
                                : result.passed
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}>
                            <div className="flex items-center justify-center mb-3">
                                {(!canShowScore || result.passed)
                                    ? <CheckCircle2 className="h-12 w-12 opacity-90" />
                                    : <XCircle className="h-12 w-12 opacity-90" />
                                }
                            </div>
                            <h1 className="text-2xl font-extrabold text-center">
                                {!canShowScore
                                    ? 'Ujian Selesai Dikirim'
                                    : result.passed 
                                        ? 'Selamat! Anda Lulus KKM' 
                                        : 'Belum Lulus KKM'
                                }
                            </h1>
                            <p className="text-center text-sm text-white/80 mt-1">
                                {exam.vtitle}
                            </p>
                        </div>

                        {/* Score Display */}
                        <div className="p-6 space-y-5">
                            {canShowScore ? (
                                <>
                                    <div className="text-center">
                                        <p className="text-5xl font-black text-gray-900">{result.percentage}%</p>
                                        <p className="text-sm font-medium text-gray-500 mt-1">
                                            Skor: {result.score} / {result.totalPoints}
                                        </p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                                                result.passed ? 'bg-emerald-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${result.percentage}%` }}
                                        />
                                        <div
                                            className="absolute inset-y-0 w-0.5 bg-gray-400"
                                            style={{ left: `${exam.npass_grade || 70}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right">KKM: {exam.npass_grade || 70}%</p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-xl bg-blue-50 p-3 text-center">
                                            <p className="text-lg font-extrabold text-gray-900">{result.totalQuestions}</p>
                                            <p className="text-[10px] font-semibold text-gray-500">Total Soal</p>
                                        </div>
                                        <div className="rounded-xl bg-emerald-50 p-3 text-center">
                                            <p className="text-lg font-extrabold text-emerald-600">{result.correctCount}</p>
                                            <p className="text-[10px] font-semibold text-gray-500">Benar</p>
                                        </div>
                                        <div className="rounded-xl bg-red-50 p-3 text-center">
                                            <p className="text-lg font-extrabold text-red-600">{result.totalQuestions - result.correctCount}</p>
                                            <p className="text-[10px] font-semibold text-gray-500">Salah</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4 px-2 space-y-3">
                                    <div className="mx-auto max-w-sm rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                                        <p className="text-xs text-indigo-800 leading-relaxed font-semibold">
                                            Jawaban ujian Anda berhasil terkirim. Guru menonaktifkan tampilan nilai langsung untuk ujian ini. Evaluasi akhir akan dipublikasikan oleh sekolah.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => router.push(`/my-modules/${moduleId}`)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md hover:shadow-lg"
                            >
                                Kembali ke Modul
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════
    // PHASE: TAKING EXAM
    // ═══════════════════════════════════
    const currentQuestion = questions[currentIndex]
    const currentOptions = parseOptions(currentQuestion)
    const currentAnswer = answers[currentQuestion.nid] || ''

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] pb-8">
            {/* Beautiful Floating Header Card - Full Width */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-5">
                <div className="flex items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                        <h2 className="text-sm font-bold text-gray-900 line-clamp-1">{exam.vtitle}</h2>
                        {isFullscreenRequired && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-bold">
                                MODE PROCTORED (LAYAR PENUH)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-semibold text-gray-500">
                            {answeredCount}/{questions.length} dijawab
                        </span>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                            timerUrgency === 'critical'
                                ? 'bg-rose-100 text-rose-700 animate-pulse'
                                : timerUrgency === 'warning'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-700'
                        }`}>
                            <Clock className="h-3.5 w-3.5" />
                            {timerFormatted}
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-100 rounded-b-2xl overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-300"
                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                {/* Main Question Area */}
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                        {/* Question Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500">
                                    Soal {currentIndex + 1} dari {questions.length}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        currentQuestion.vtype === 'multiple_choice' ? 'bg-blue-100 text-blue-700' :
                                        currentQuestion.vtype === 'true_false' ? 'bg-purple-100 text-purple-700' :
                                        'bg-teal-100 text-teal-700'
                                    }`}>
                                        {currentQuestion.vtype === 'multiple_choice' ? 'Pilihan Ganda' :
                                         currentQuestion.vtype === 'true_false' ? 'Benar / Salah' : 'Essay'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold">
                                        {currentQuestion.npoints} poin
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Question Body */}
                        <div className="p-6 space-y-5 flex-1">
                            <p className="text-[15px] font-semibold text-gray-900 leading-relaxed">
                                {currentQuestion.vquestion}
                            </p>

                            {/* Answer Options */}
                            <div className="space-y-2.5">
                                {currentQuestion.vtype === 'multiple_choice' && (
                                    <>
                                        {(['A', 'B', 'C', 'D'] as const).map(key => {
                                            const optText = currentOptions[key]
                                            if (!optText) return null
                                            const isSelected = currentAnswer === key
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setAnswer(currentQuestion.nid, key)}
                                                    className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                                                        isSelected
                                                            ? 'border-red-500 bg-red-50 shadow-sm'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                                        isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {key}
                                                    </span>
                                                    <span className="text-sm text-gray-800 pt-0.5">{optText}</span>
                                                </button>
                                            )
                                        })}
                                    </>
                                )}

                                {currentQuestion.vtype === 'true_false' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {(['A', 'B'] as const).map(key => {
                                            const label = key === 'A' 
                                                ? (currentOptions.true_text || 'Benar') 
                                                : (currentOptions.false_text || 'Salah')
                                            const isSelected = currentAnswer === key
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setAnswer(currentQuestion.nid, key)}
                                                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${
                                                        isSelected
                                                            ? 'border-red-500 bg-red-50 shadow-sm'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className={`text-base font-bold ${isSelected ? 'text-red-700' : 'text-gray-800'}`}>
                                                        {label}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                {currentQuestion.vtype === 'essay' && (
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => setAnswer(currentQuestion.nid, e.target.value)}
                                        placeholder="Tuliskan jawaban lengkap Anda di sini..."
                                        className="w-full min-h-[150px] p-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                            <button
                                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentIndex === 0}
                                className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </button>

                            {currentIndex < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="inline-flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors"
                                >
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowConfirmSubmit(true)}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md"
                                >
                                    Submit Ujian
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Question Navigator */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">Navigasi Soal</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isCurrent = currentIndex === idx
                                const isAnswered = !!answers[q.nid]
                                return (
                                    <button
                                        key={q.nid}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-bold transition-all border ${
                                            isCurrent
                                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                                : isAnswered
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Submit Dialog */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mx-auto">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-gray-900">Kumpulkan Ujian?</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Anda telah menjawab {answeredCount} dari {questions.length} soal. Pastikan semua jawaban telah diteliti sebelum menyerahkan.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors"
                            >
                                Periksa Kembali
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-1"
                            >
                                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Ya, Kumpulkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warn Anti-Cheat Locked Overlay Modal */}
            {showCheatModal && isFullscreenRequired && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 select-none">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-8 space-y-6 text-center shadow-2xl border border-red-100">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 mx-auto">
                            <ShieldAlert className="h-8 w-8 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-black text-gray-900">Layar Terkunci (Deteksi Anti-Curang)</h2>
                            <p className="text-xs text-red-600 leading-relaxed font-semibold">
                                Anda terdeteksi keluar dari mode ujian! Seluruh aktivitas keluar layar/tab dicatat sebagai pelanggaran ({violations}x pelanggaran terdeteksi).
                            </p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Klik tombol di bawah ini untuk kembali ke mode layar penuh dan melanjutkan ujian Anda.
                            </p>
                        </div>
                        <button
                            onClick={requestFullscreen}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                        >
                            Kembali ke Layar Penuh (Fullscreen)
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
