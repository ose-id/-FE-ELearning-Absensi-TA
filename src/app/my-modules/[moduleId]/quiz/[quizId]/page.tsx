'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Send, BookOpen, Timer, Trophy, BarChart3 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import { quizService } from '@/services/quiz.service'
import { Quiz, QuizQuestion, StudentQuizAttempt } from '@/types/quiz'

// ─── Types ───
type QuizPhase = 'intro' | 'taking' | 'result'

interface QuizOptionData {
    A?: string
    B?: string
    C?: string
    D?: string
    true_text?: string
    false_text?: string
    guide?: string
}

interface QuizResult {
    score: number
    totalPoints: number
    percentage: number
    correctCount: number
    totalQuestions: number
    passed: boolean
}

// ─── Timer Hook ───
function useCountdown(endTime: Date | null, isRunning: boolean, onExpire: () => void) {
    const [now, setNow] = useState(new Date())
    const onExpireRef = useRef(onExpire)

    useEffect(() => {
        onExpireRef.current = onExpire
    })

    // Update 'now' every second when running
    useEffect(() => {
        if (!isRunning || !endTime) return
        
        // Initial sync of 'now' when timer starts/resumes via setTimeout to avoid synchronous cascading renders
        const timeoutId = setTimeout(() => {
            setNow(new Date())
        }, 0)
        
        const id = setInterval(() => {
            setNow(new Date())
        }, 1000)
        
        return () => {
            clearTimeout(timeoutId)
            clearInterval(id)
        }
    }, [isRunning, endTime])

    const secondsLeft = useMemo(() => {
        if (!endTime) return 0
        const diff = Math.floor((endTime.getTime() - now.getTime()) / 1000)
        return Math.max(0, diff)
    }, [endTime, now])

    // Safely trigger expiration callback
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

// ─── Main Component ───
export default function StudentQuizPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)
    const quizId = parseInt(params.quizId as string)

    const [phase, setPhase] = useState<QuizPhase>('intro')
    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<QuizResult | null>(null)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

    // Fetch quiz and questions
    useEffect(() => {
        if (!session?.accessToken) return
        const token = session.accessToken

        const fetchData = async () => {
            try {
                const studentId = session?.user?.id ? parseInt(session.user.id, 10) : 0
                const [quizRes, questionsRes] = await Promise.all([
                    quizService.getQuizById(quizId, token),
                    quizService.getQuestions(quizId, token),
                ])
                console.log('[DEBUG] Fetched Quiz:', quizRes)
                console.log('[DEBUG] Fetched Questions raw response:', questionsRes)
                setQuiz(quizRes)
                
                // Sort questions by order
                const sorted = (questionsRes.data || []).sort((a: QuizQuestion, b: QuizQuestion) => a.norder - b.norder)
                console.log('[DEBUG] Sorted & Mapped Questions:', sorted)
                setQuestions(sorted)

                // Check completed attempts from localStorage
                let completedAttempt: StudentQuizAttempt | null = null
                if (typeof window !== 'undefined' && studentId) {
                    const localData = localStorage.getItem(`elearn_quiz_completed_${studentId}_${quizId}`)
                    if (localData) {
                        try {
                            completedAttempt = JSON.parse(localData)
                        } catch (e) {
                            console.error('Failed to parse local completion:', e)
                        }
                    }
                }

                if (completedAttempt && quizRes) {
                    const score = completedAttempt.nscore ?? 0
                    const maxScore = quizRes.nmax_score || 100
                    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
                    const passingScore = quizRes.npassing_score || 60
                    
                    setResult({
                        score,
                        totalPoints: maxScore,
                        percentage: pct,
                        correctCount: Math.round((pct / 100) * sorted.length),
                        totalQuestions: sorted.length,
                        passed: pct >= passingScore
                    })
                    setPhase('result')
                } else if (typeof window !== 'undefined') {
                    // Load saved progress from localStorage if it exists
                    const savedPhase = localStorage.getItem(`elearn_quiz_phase_${quizId}`)
                    const savedStartTime = localStorage.getItem(`elearn_quiz_start_time_${quizId}`)
                    const savedAnswers = localStorage.getItem(`elearn_quiz_answers_${quizId}`)

                    if (savedAnswers) {
                        try {
                            setAnswers(JSON.parse(savedAnswers))
                        } catch (e) {
                            console.error('Failed to parse saved answers:', e)
                        }
                    }

                    if (savedPhase === 'taking' && savedStartTime && quizRes) {
                        const originalStart = new Date(savedStartTime)
                        const elapsed = Math.floor((new Date().getTime() - originalStart.getTime()) / 1000)
                        const durationInSeconds = quizRes.nduration * 60
                        const remaining = durationInSeconds - elapsed

                        if (remaining > 0) {
                            setStartTime(originalStart)
                            setPhase('taking')
                        } else {
                            // Expired while away, clear state
                            localStorage.removeItem(`elearn_quiz_phase_${quizId}`)
                            localStorage.removeItem(`elearn_quiz_start_time_${quizId}`)
                            localStorage.removeItem(`elearn_quiz_answers_${quizId}`)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch quiz data:', error)
                toast.error('Gagal memuat data kuis')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [session?.accessToken, session?.user?.id, quizId])

    // ─── Scoring Logic ───
    const calculateResult = useCallback((): QuizResult => {
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
                // Essay questions: give full points if answered (manual grading by teacher)
                if (studentAnswer.length > 0) {
                    correctCount++
                    score += q.npoints
                }
            }
        })

        const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
        const passingScore = quiz?.npassing_score || 60
        return { score, totalPoints, percentage, correctCount, totalQuestions: questions.length, passed: percentage >= passingScore }
    }, [answers, questions, quiz])

    // ─── Submit Handler ───
    const handleSubmit = useCallback(async () => {
        if (!session?.accessToken || !quiz || isSubmitting) return
        setIsSubmitting(true)
        setShowConfirmSubmit(false)

        try {
            const quizResult = calculateResult()
            const finishTime = new Date()

            await quizService.submitQuizAttempt(quizId, {
                AnswerCount: Object.keys(answers).length,
                StartAt: startTime?.toISOString() || finishTime.toISOString(),
                FinishAt: finishTime.toISOString(),
                Score: quizResult.score,
                Percentage: quizResult.percentage,
            }, session.accessToken)

            // Clear saved localStorage progress and set completed state
            if (typeof window !== 'undefined') {
                localStorage.removeItem(`elearn_quiz_phase_${quizId}`)
                localStorage.removeItem(`elearn_quiz_start_time_${quizId}`)
                localStorage.removeItem(`elearn_quiz_answers_${quizId}`)

                const studentId = session?.user?.id ? parseInt(session.user.id, 10) : 0
                if (studentId) {
                    const completionData = {
                        nid_quiz: quizId,
                        nid_student: studentId,
                        nscore: quizResult.score,
                        npercentage: quizResult.percentage,
                        dend: finishTime.toISOString(),
                        nstatus: 2
                    }
                    localStorage.setItem(`elearn_quiz_completed_${studentId}_${quizId}`, JSON.stringify(completionData))
                }
            }

            setResult(quizResult)
            setPhase('result')
            toast.success('Kuis berhasil disubmit!')
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Gagal mengirim kuis'
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }, [session?.accessToken, session?.user?.id, quiz, quizId, answers, startTime, calculateResult, isSubmitting])

    // Timer expiry auto-submit
    const handleTimerExpire = useCallback(() => {
        toast.warning('Waktu habis! Kuis otomatis disubmit.')
        handleSubmit()
    }, [handleSubmit])

    const endTime = useMemo(() => {
        if (!startTime || !quiz) return null
        return new Date(startTime.getTime() + quiz.nduration * 60 * 1000)
    }, [startTime, quiz])

    const { formatted: timerFormatted, urgency: timerUrgency } = useCountdown(
        endTime,
        phase === 'taking',
        handleTimerExpire
    )

    // ─── Answer Handler ───
    const setAnswer = (questionId: number, value: string) => {
        setAnswers(prev => {
            const next = { ...prev, [questionId]: value }
            if (typeof window !== 'undefined') {
                localStorage.setItem(`elearn_quiz_answers_${quizId}`, JSON.stringify(next))
            }
            return next
        })
    }

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

    // ─── Start Quiz ───
    const handleStartQuiz = () => {
        const start = new Date()
        setStartTime(start)
        setPhase('taking')
        if (typeof window !== 'undefined') {
            localStorage.setItem(`elearn_quiz_phase_${quizId}`, 'taking')
            localStorage.setItem(`elearn_quiz_start_time_${quizId}`, start.toISOString())
        }
    }

    // ─── Parse Options ───
    const parseOptions = (q: QuizQuestion): QuizOptionData => {
        if (!q.voptions) return {}
        try {
            let parsed: unknown = q.voptions
            if (typeof q.voptions === 'string') {
                parsed = JSON.parse(q.voptions)
            }

            // Case 1: Already a standard key-value object { A: '...', B: '...' }
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                const result: QuizOptionData = {}
                const obj = parsed as Record<string, unknown>
                if (obj.A || obj.a) result.A = String(obj.A || obj.a)
                if (obj.B || obj.b) result.B = String(obj.B || obj.b)
                if (obj.C || obj.c) result.C = String(obj.C || obj.c)
                if (obj.D || obj.d) result.D = String(obj.D || obj.d)
                if (obj.true_text) result.true_text = String(obj.true_text)
                if (obj.false_text) result.false_text = String(obj.false_text)
                return result
            }

            // Case 2: Array of objects or strings
            if (Array.isArray(parsed)) {
                const result: QuizOptionData = {}
                const keys = ['A', 'B', 'C', 'D'] as const
                (parsed as unknown[]).forEach((item: unknown, idx: number) => {
                    if (idx < 4) {
                        const key = keys[idx]
                        if (typeof item === 'string') {
                            result[key] = item
                        } else if (item && typeof item === 'object') {
                            const itemObj = item as Record<string, unknown>
                            const val = itemObj.text || itemObj.value || itemObj.label || itemObj.voption_text || itemObj.text_options || Object.values(itemObj)[0]
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
            console.error('[DEBUG] parseOptions failed to parse:', q.voptions, e)
            return {}
        }
    }

    // ─── Loading State ───
    if (loading) {
        return (
            <div className="py-24 w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-gray-500">Memuat kuis...</p>
                </div>
            </div>
        )
    }

    if (!quiz || questions.length === 0) {
        return (
            <div className="py-24 w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto" />
                    <h2 className="text-lg font-bold text-gray-800">Kuis Tidak Tersedia</h2>
                    <p className="text-sm text-gray-500">Kuis ini belum memiliki soal atau tidak ditemukan.</p>
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
                <div className="w-full max-w-5xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => router.push(`/my-modules/${moduleId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors mb-4"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Modul
                    </button>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="h-5 w-5 opacity-80" />
                                <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Kuis</span>
                            </div>
                            <h1 className="text-xl font-extrabold tracking-tight">{quiz.vtitle}</h1>
                            {quiz.vdesc && (
                                <p className="mt-2 text-sm text-white/80 leading-relaxed">{quiz.vdesc}</p>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5 text-center">
                                    <Timer className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">{quiz.nduration}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Menit</p>
                                </div>
                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 text-center">
                                    <BarChart3 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">{questions.length}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Soal</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-center">
                                    <Trophy className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">{quiz.npassing_score || 60}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Passing Score</p>
                                </div>
                                <div className="rounded-xl bg-purple-50 border border-purple-100 p-3.5 text-center">
                                    <CheckCircle2 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                                    <p className="text-lg font-extrabold text-gray-900">
                                        {quiz.nmax_attempts || 1}x
                                    </p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Percobaan Maks</p>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                <div className="flex items-start gap-2.5">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                    <div className="text-xs text-amber-800 space-y-1">
                                        <p className="font-bold">Perhatian sebelum memulai:</p>
                                        <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                                            <li>Timer akan berjalan otomatis setelah kuis dimulai</li>
                                            <li>Kuis akan otomatis disubmit jika waktu habis</li>
                                            <li>Pastikan koneksi internet stabil</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={handleStartQuiz}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Mulai Kuis Sekarang
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
        const canShowScore = !quiz || quiz.nshow_results !== 0

        return (
            <div className="w-full py-4">
                <div className="w-full max-w-xl mx-auto">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                        {/* Result Header */}
                        <div className={`p-6 text-white ${
                            !canShowScore
                                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700'
                                : result.passed
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-r from-rose-500 to-red-500'
                        }`}>
                            <div className="flex items-center justify-center mb-3">
                                {(!canShowScore || result.passed)
                                    ? <CheckCircle2 className="h-12 w-12 opacity-90" />
                                    : <XCircle className="h-12 w-12 opacity-90" />
                                }
                            </div>
                            <h1 className="text-2xl font-extrabold text-center">
                                {!canShowScore
                                    ? 'Kuis Selesai'
                                    : result.passed 
                                        ? 'Selamat! Anda Lulus' 
                                        : 'Belum Lulus'
                                }
                            </h1>
                            <p className="text-center text-sm text-white/80 mt-1">
                                {quiz.vtitle}
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
                                                result.passed ? 'bg-emerald-500' : 'bg-rose-500'
                                            }`}
                                            style={{ width: `${result.percentage}%` }}
                                        />
                                        {/* Passing score marker */}
                                        <div
                                            className="absolute inset-y-0 w-0.5 bg-gray-400"
                                            style={{ left: `${quiz.npassing_score || 60}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right">Passing Score: {quiz.npassing_score || 60}%</p>

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
                                        <div className="rounded-xl bg-rose-50 p-3 text-center">
                                            <p className="text-lg font-extrabold text-rose-600">{result.totalQuestions - result.correctCount}</p>
                                            <p className="text-[10px] font-semibold text-gray-500">Salah</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4 px-2 space-y-3">
                                    <div className="mx-auto max-w-sm rounded-xl bg-indigo-50 border border-indigo-100 p-4 shadow-inner">
                                        <p className="text-xs text-indigo-800 leading-relaxed font-semibold">
                                            Kuis Anda berhasil dikirimkan. Untuk kuis ini, guru telah menonaktifkan tampilan skor langsung ke siswa. Nilai Anda telah tercatat dengan aman di database pembelajaran.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => router.push(`/my-modules/${moduleId}`)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
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
    // PHASE: TAKING QUIZ
    // ═══════════════════════════════════
    const currentQuestion = questions[currentIndex]
    const currentOptions = parseOptions(currentQuestion)
    const currentAnswer = answers[currentQuestion.nid] || ''

    return (
        <div className="w-full pb-8">
            {/* Beautiful Floating Header Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-4">
                <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold text-gray-900 line-clamp-1">{quiz.vtitle}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Progress */}
                        <span className="text-[11px] font-semibold text-gray-500">
                            {answeredCount}/{questions.length} dijawab
                        </span>
                        {/* Timer */}
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
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-5">
                {/* Main Question Area */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Question Card */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
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
                        <div className="p-5 space-y-5">
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
                                                            ? 'border-amber-500 bg-amber-50 shadow-sm'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                                        isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
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
                                    <>
                                        {[
                                            { key: 'true', label: currentOptions.true_text || 'Benar' },
                                            { key: 'false', label: currentOptions.false_text || 'Salah' },
                                        ].map(opt => {
                                            const isSelected = currentAnswer === opt.key
                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => setAnswer(currentQuestion.nid, opt.key)}
                                                    className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                                                        isSelected
                                                            ? 'border-amber-500 bg-amber-50 shadow-sm'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                        isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {opt.key === 'true' ? 'B' : 'S'}
                                                    </span>
                                                    <span className="text-sm text-gray-800">{opt.label}</span>
                                                </button>
                                            )
                                        })}
                                    </>
                                )}

                                {currentQuestion.vtype === 'essay' && (
                                    <div className="space-y-2">
                                        <textarea
                                            value={currentAnswer}
                                            onChange={(e) => setAnswer(currentQuestion.nid, e.target.value)}
                                            placeholder="Tulis jawaban Anda di sini..."
                                            rows={6}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all resize-none"
                                        />
                                        <p className="text-[10px] text-gray-400 text-right">
                                            {currentAnswer.length} karakter
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Sebelumnya
                        </button>

                        {/* Mobile Submit */}
                        <button
                            onClick={() => setShowConfirmSubmit(true)}
                            disabled={isSubmitting}
                            className="md:hidden inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Submit
                        </button>

                        <button
                            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                            disabled={currentIndex === questions.length - 1}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Selanjutnya
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Question Navigation Sidebar */}
                <div className="hidden md:block w-52 shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Navigasi Soal</p>
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = !!answers[q.nid]
                                const isCurrent = idx === currentIndex
                                return (
                                    <button
                                        key={q.nid}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                                            isCurrent
                                                ? 'bg-amber-500 text-white ring-2 ring-amber-200 shadow-sm'
                                                : isAnswered
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="space-y-2 pt-2 border-t border-gray-100 text-[10px]">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded bg-amber-500" />
                                <span className="text-gray-500 font-medium">Soal saat ini</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded bg-emerald-100 border border-emerald-200" />
                                <span className="text-gray-500 font-medium">Sudah dijawab</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded bg-white border border-gray-200" />
                                <span className="text-gray-500 font-medium">Belum dijawab</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={() => setShowConfirmSubmit(true)}
                            disabled={isSubmitting}
                            className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            <Send className="h-3.5 w-3.5 inline mr-1" />
                            Submit Kuis
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Submit Dialog */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4">
                        <div className="text-center">
                            <Send className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-gray-900">Submit Kuis?</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Anda telah menjawab <span className="font-bold text-amber-600">{answeredCount}</span> dari <span className="font-bold">{questions.length}</span> soal.
                            </p>
                            {answeredCount < questions.length && (
                                <p className="text-xs text-rose-500 font-medium mt-2">
                                    ⚠️ Masih ada {questions.length - answeredCount} soal yang belum dijawab
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                    'Ya, Submit'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
