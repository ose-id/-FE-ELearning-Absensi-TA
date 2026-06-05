'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, FileText, PenLine, ClipboardList, ClipboardCheck, BookOpen, ExternalLink, Calendar, Clock, GraduationCap, User, Play, ChevronDown, Layers, X, Download, Check, BookOpenCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import { learningModuleService } from '@/services/learning-module.service'
import { materialService } from '@/services/material.service'
import { quizService } from '@/services/quiz.service'
import { examService } from '@/services/exam.service'
import { assignmentService } from '@/services/assignment.service'
import { LearningModule } from '@/types/learning-module'
import { Material } from '@/types/material'
import { Quiz, StudentQuizAttempt } from '@/types/quiz'
import { Exam } from '@/types/exam'
import { Assignment } from '@/types/assignment'

// --- Types for weekly grouping ---
type ContentItem = {
    type: 'material' | 'assignment' | 'quiz' | 'exam'
    date: Date
    data: Material | Assignment | Quiz | Exam
}

type WeekGroup = {
    weekLabel: string
    weekStart: Date
    weekEnd: Date
    items: ContentItem[]
    materialCount: number
    assignmentCount: number
    quizCount: number
    examCount: number
}

// --- Helper: get the Monday of a given date's week ---
function getMonday(d: Date): Date {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    date.setDate(diff)
    date.setHours(0, 0, 0, 0)
    return date
}

// --- Helper: format date range ---
function formatWeekRange(start: Date, end: Date): string {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const startStr = start.toLocaleDateString('id-ID', opts)
    const endStr = end.toLocaleDateString('id-ID', { ...opts, year: 'numeric' })
    return `${startStr} – ${endStr}`
}

export default function StudentModuleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)

    const [module, setModule] = useState<LearningModule | null>(null)
    const [materials, setMaterials] = useState<Material[]>([])
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [exams, setExams] = useState<Exam[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [quizAttempts, setQuizAttempts] = useState<StudentQuizAttempt[]>([])
    const [readMaterials, setReadMaterials] = useState<Set<number>>(new Set())
    const [submittedAssignments, setSubmittedAssignments] = useState<Record<number, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => new Set())
    const [activeMaterial, setActiveMaterial] = useState<Material | null>(null)
    const hasAutoExpanded = useRef(false)

    useEffect(() => {
        if (!session?.accessToken) return
        const token = session.accessToken

        const fetchAllData = async () => {
            try {
                const studentId = session?.user?.id ? parseInt(session.user.id, 10) : 0
                const [moduleRes, materialsRes, quizzesRes, examsRes, assignmentsRes] = await Promise.all([
                    learningModuleService.getLearningModuleById(moduleId, token).catch(() => null),
                    materialService.getMaterialsByLearningModule(moduleId, token).catch(() => ({ data: [] })),
                    quizService.getQuizzesByModule(moduleId, token).catch(() => ({ data: [] })),
                    examService.getExamsByModule(moduleId, token).catch(() => ({ data: [] })),
                    assignmentService.getAssignments(token).catch(() => ({ data: [] })),
                ])

                setModule(moduleRes)
                setMaterials(materialsRes.data || [])
                const quizList = quizzesRes.data || []
                setQuizzes(quizList)
                setExams(examsRes.data || [])
                const filtered = assignmentsRes.data?.filter((a: Assignment) => a.learning_module_id === moduleId) || []
                setAssignments(filtered)

                // Fetch attempts for each quiz from localStorage
                const localAttempts: StudentQuizAttempt[] = []
                if (typeof window !== 'undefined' && studentId) {
                    quizList.forEach(q => {
                        const localData = localStorage.getItem(`elearn_quiz_completed_${studentId}_${q.nid}`)
                        if (localData) {
                            try {
                                const parsed = JSON.parse(localData)
                                localAttempts.push(parsed)
                            } catch (e) {
                                console.error('Failed to parse local attempt:', e)
                            }
                        }
                    })
                }
                setQuizAttempts(localAttempts)

                // Load read materials from localStorage
                const localRead = new Set<number>()
                if (typeof window !== 'undefined' && studentId) {
                    (materialsRes.data || []).forEach((m: Material) => {
                        if (localStorage.getItem(`elearn_material_read_${studentId}_${m.nid}`) === 'true') {
                            localRead.add(m.nid)
                        }
                    })
                }
                setReadMaterials(localRead)

                // Load assignment submissions status
                if (session?.accessToken && assignmentsRes.data) {
                    const subRecord: Record<number, boolean> = {}
                    await Promise.all(filtered.map(async (a: Assignment) => {
                        const sub = await assignmentService.getMySubmission(a.id, token).catch(() => null)
                        if (sub) {
                            subRecord[a.id] = true
                        }
                    }))
                    setSubmittedAssignments(subRecord)
                }

            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllData()
    }, [session?.accessToken, session?.user?.id, moduleId])

    // --- Build weekly groups ---
    const weekGroups: WeekGroup[] = useMemo(() => {
        const allItems: ContentItem[] = []

        materials.forEach(m => {
            const dateVal = m.dcrea ? new Date(m.dcrea) : new Date()
            allItems.push({ type: 'material', date: dateVal, data: m })
        })
        assignments.forEach(a => {
            const dateVal = a.created_at ? new Date(a.created_at) : new Date()
            allItems.push({ type: 'assignment', date: dateVal, data: a })
        })
        quizzes.forEach(q => {
            const dateVal = q.dcrea ? new Date(q.dcrea) : new Date()
            allItems.push({ type: 'quiz', date: dateVal, data: q })
        })
        exams.forEach(e => {
            const dateVal = e.dcrea ? new Date(e.dcrea) : new Date()
            allItems.push({ type: 'exam', date: dateVal, data: e })
        })

        // Sort all items by date descending (newest first)
        allItems.sort((a, b) => b.date.getTime() - a.date.getTime())

        // Group by week
        const weekMap = new Map<string, WeekGroup>()

        allItems.forEach(item => {
            const monday = getMonday(item.date)
            const sunday = new Date(monday)
            sunday.setDate(sunday.getDate() + 6)
            const key = monday.toISOString()

            if (!weekMap.has(key)) {
                weekMap.set(key, {
                    weekLabel: formatWeekRange(monday, sunday),
                    weekStart: monday,
                    weekEnd: sunday,
                    items: [],
                    materialCount: 0,
                    assignmentCount: 0,
                    quizCount: 0,
                    examCount: 0,
                })
            }

            const group = weekMap.get(key)!
            group.items.push(item)
            if (item.type === 'material') group.materialCount++
            else if (item.type === 'assignment') group.assignmentCount++
            else if (item.type === 'quiz') group.quizCount++
            else if (item.type === 'exam') group.examCount++
        })

        // Sort weeks descending (most recent first)
        return Array.from(weekMap.values()).sort(
            (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
        )
    }, [materials, assignments, quizzes, exams])

    // Auto-expand the most recent week on first load
    useEffect(() => {
        if (weekGroups.length > 0 && !hasAutoExpanded.current) {
            hasAutoExpanded.current = true
            setExpandedWeeks(new Set([weekGroups[0].weekStart.toISOString()]))
        }
    }, [weekGroups])

    const toggleWeek = (weekKey: string) => {
        setExpandedWeeks(prev => {
            const next = new Set(prev)
            if (next.has(weekKey)) {
                next.delete(weekKey)
            } else {
                next.add(weekKey)
            }
            return next
        })
    }

    const expandAll = () => {
        setExpandedWeeks(new Set(weekGroups.map(w => w.weekStart.toISOString())))
    }

    const collapseAll = () => {
        setExpandedWeeks(new Set())
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <p className="text-gray-500">Modul tidak ditemukan</p>
            </div>
        )
    }

    const moduleClass = module.Class || module.class
    const moduleSubject = module.Subject || module.subject
    const moduleTeacher = module.Teacher || module.teacher

    const subjectName = moduleSubject 
        ? (moduleSubject.vsubject_name || (moduleSubject as { vname?: string }).vname || 'No subject')
        : 'No subject'
    const className = moduleClass 
        ? (moduleClass.vname || (moduleClass as { vclass_name?: string }).vclass_name || `Class ${module.nid_class}`)
        : `Class ${module.nid_class}`
    const teacherName = moduleTeacher 
        ? (moduleTeacher.vfull_name || moduleTeacher.vname || 'Assigned Teacher')
        : 'Assigned Teacher'

    const totalItems = materials.length + assignments.length + quizzes.length + exams.length

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 pb-8">
            <div className="mx-auto max-w-5xl space-y-5 p-4.5">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-5 text-white shadow-md">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/5 blur-xl" />
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                    
                    <div className="relative flex flex-col gap-4">
                        <div>
                            <button
                                onClick={() => router.push('/my-modules')}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Kembali ke Modul Saya
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            <div>
                                <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
                                    {module.vname}
                                </h1>
                                <p className="mt-1 text-xs text-blue-100 max-w-2xl font-light">
                                    {module.vdesc || 'Modul pembelajaran interaktif untuk siswa.'}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 text-white text-[11px] font-medium rounded-full border border-white/5">
                                    <GraduationCap className="h-3 w-3" />
                                    {className}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 text-white text-[11px] font-medium rounded-full border border-white/5">
                                    <BookOpen className="h-3 w-3" />
                                    {subjectName}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 text-white text-[11px] font-medium rounded-full border border-white/5">
                                    <User className="h-3 w-3" />
                                    {teacherName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                            <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-gray-900 leading-none">{materials.length}</p>
                            <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Materi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                            <PenLine className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-gray-900 leading-none">{assignments.length}</p>
                            <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Tugas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                            <ClipboardList className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-gray-900 leading-none">{quizzes.length}</p>
                            <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Kuis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
                            <ClipboardCheck className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-gray-900 leading-none">{exams.length}</p>
                            <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Ujian</p>
                        </div>
                    </div>
                </div>

                {/* Timeline Header */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        <h2 className="text-sm font-bold text-gray-900">Timeline Mingguan</h2>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                            {weekGroups.length} Minggu
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={expandAll}
                            className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Buka Semua
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={collapseAll}
                            className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Tutup Semua
                        </button>
                    </div>
                </div>

                {/* Weekly Accordion */}
                {totalItems === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-700">Belum Ada Konten</h3>
                        <p className="mt-1 text-xs text-gray-500">Guru belum mempublikasikan aktivitas apa pun untuk modul ini.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {weekGroups.map((week, weekIndex) => {
                            const weekKey = week.weekStart.toISOString()
                            const isExpanded = expandedWeeks.has(weekKey)
                            const isCurrentWeek = (() => {
                                const now = new Date()
                                return now >= week.weekStart && now <= week.weekEnd
                            })()

                            return (
                                <div
                                    key={weekKey}
                                    className={`rounded-xl border bg-white shadow-sm transition-all duration-300 ${
                                        isCurrentWeek
                                            ? 'border-indigo-300 ring-1 ring-indigo-100'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {/* Week Header (Clickable) */}
                                    <button
                                        onClick={() => toggleWeek(weekKey)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${
                                                isCurrentWeek
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                            }`}>
                                                {weekGroups.length - weekIndex}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[13px] font-bold text-gray-900">
                                                        Minggu {weekGroups.length - weekIndex}
                                                    </h3>
                                                    {isCurrentWeek && (
                                                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-full animate-pulse">
                                                            MINGGU INI
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-500 font-medium">{week.weekLabel}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            {/* Mini badges showing content breakdown */}
                                            <div className="hidden sm:flex items-center gap-1.5">
                                                {week.materialCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-bold rounded-full">
                                                        <FileText className="h-2.5 w-2.5" />{week.materialCount}
                                                    </span>
                                                )}
                                                {week.assignmentCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full">
                                                        <PenLine className="h-2.5 w-2.5" />{week.assignmentCount}
                                                    </span>
                                                )}
                                                {week.quizCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-full">
                                                        <ClipboardList className="h-2.5 w-2.5" />{week.quizCount}
                                                    </span>
                                                )}
                                                {week.examCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded-full">
                                                        <ClipboardCheck className="h-2.5 w-2.5" />{week.examCount}
                                                    </span>
                                                )}
                                            </div>
                                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    {/* Expandable Content */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                                            {week.items.map((item, itemIndex) => {
                                                let completedAttempt = undefined
                                                let isMaterialRead = false
                                                let isAssignmentSubmitted = false

                                                if (item.type === 'quiz') {
                                                    const q = item.data as Quiz
                                                    completedAttempt = quizAttempts.find(a => a.nid_quiz === q.nid && a.nstatus === 2)
                                                } else if (item.type === 'material') {
                                                    const m = item.data as Material
                                                    isMaterialRead = readMaterials.has(m.nid)
                                                } else if (item.type === 'assignment') {
                                                    const a = item.data as Assignment
                                                    isAssignmentSubmitted = !!submittedAssignments[a.id]
                                                }

                                                return (
                                                    <WeeklyContentItem
                                                        key={`${item.type}-${itemIndex}`}
                                                        item={item}
                                                        router={router}
                                                        moduleId={moduleId}
                                                        onViewMaterial={setActiveMaterial}
                                                        completedAttempt={completedAttempt}
                                                        isMaterialRead={isMaterialRead}
                                                        isAssignmentSubmitted={isAssignmentSubmitted}
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Custom Interactive Material Reader Modal */}
            {activeMaterial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="relative w-full max-w-4xl h-[85vh] rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-xl">
                                    <BookOpenCheck className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold line-clamp-1">{activeMaterial.vtitle}</h3>
                                    <p className="text-[11px] text-indigo-200 font-medium">Materi Pembelajaran</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        toast.success('Materi berhasil diunduh (Simulasi)')
                                    }}
                                    className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors"
                                    title="Unduh File"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setActiveMaterial(null)}
                                    className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body (Sidebar + Content) */}
                        <div className="flex-1 flex overflow-hidden bg-gray-50">
                            {/* Left Sidebar (Simulated Table of Contents) */}
                            <div className="hidden md:block w-64 border-r border-gray-200 bg-white overflow-y-auto p-4 space-y-4 shrink-0">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Daftar Isi</p>
                                <div className="space-y-1">
                                    {[
                                        { id: '1', title: '1. Pendahuluan & Pengenalan' },
                                        { id: '2', title: '2. Konsep dan Teori Dasar' },
                                        { id: '3', title: '3. Implementasi Praktis' },
                                        { id: '4', title: '4. Studi Kasus & Contoh' },
                                        { id: '5', title: '5. Rangkuman & Latihan Soal' }
                                    ].map((sec, idx) => (
                                        <button
                                            key={sec.id}
                                            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                                                idx === 0
                                                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            {sec.title}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
                                        <h4 className="text-[11px] font-bold text-indigo-900">Tips Belajar</h4>
                                        <p className="text-[10px] text-indigo-700 mt-1 leading-relaxed">
                                            Baca materi secara perlahan, catat poin-poin penting, dan cobalah mengerjakan kuis terkait setelah selesai.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel (Elegant simulated reader document) */}
                            <div className="flex-1 overflow-y-auto p-8 bg-white flex flex-col">
                                <div className="max-w-2xl mx-auto space-y-6 flex-1 w-full">
                                    {/* Document Header */}
                                    <div className="border-b border-gray-200 pb-4">
                                        <h1 className="text-2xl font-extrabold text-gray-900">{activeMaterial.vtitle}</h1>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                                            <span>Format: PDF</span>
                                            <span>•</span>
                                            <span>Ukuran: {(activeMaterial.nfile_size ? (activeMaterial.nfile_size / 1024).toFixed(1) : '1.2')} KB</span>
                                        </div>
                                    </div>

                                    {/* Document Simulated Content */}
                                    <div className="prose prose-sm text-gray-800 space-y-4 leading-relaxed">
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {activeMaterial.vdescription || 'Materi pembelajaran interaktif untuk mendalami modul ini.'}
                                        </p>
                                        
                                        <h3 className="text-base font-bold text-gray-900 pt-2">1. Pendahuluan</h3>
                                        <p>
                                            Selamat datang di materi pembelajaran interaktif ini. Halaman ini dirancang untuk memberikan pemahaman menyeluruh tentang topik yang sedang dipelajari. Materi ini mencakup berbagai konsep kunci yang akan membantu Anda menguasai kompetensi dasar yang dibutuhkan.
                                        </p>
                                        <p>
                                            Dalam bab pendahuluan ini, kita akan membahas latar belakang topik, mengapa topik ini sangat relevan dalam industri modern, serta tujuan akhir pembelajaran yang diharapkan dapat dicapai oleh setiap siswa.
                                        </p>

                                        <h3 className="text-base font-bold text-gray-900 pt-2">2. Teori dan Konsep Dasar</h3>
                                        <p>
                                            Untuk memahami topik ini secara utuh, kita perlu membangun landasan teoretis yang kuat. Konsep dasar yang harus dikuasai meliputi struktur utama, relasi antar komponen, serta prinsip kerja sistem yang dibahas.
                                        </p>
                                        <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl text-xs text-indigo-900 leading-relaxed font-medium">
                                            <strong>Catatan Penting:</strong> Pemahaman menyeluruh terhadap bab konsep dasar ini akan sangat memudahkan Anda saat mempraktikkan materi di laboratorium komputer maupun saat menyelesaikan tugas mingguan.
                                        </div>

                                        <h3 className="text-base font-bold text-gray-900 pt-2">3. Implementasi & Rangkuman</h3>
                                        <p>
                                            Penerapan praktis dari materi ini mencakup langkah-langkah implementasi terstruktur yang dapat diaplikasikan langsung pada proyek nyata. Pastikan Anda mengikuti instruksi langkah-demi-langkah dengan cermat untuk menghindari kesalahan umum yang sering dialami oleh pemula.
                                        </p>
                                    </div>
                                </div>

                                {/* Reader Footer (Mark as Completed button) */}
                                <div className="mt-8 border-t border-gray-100 pt-6 flex items-center justify-between shrink-0">
                                    <div className="text-xs text-gray-500 font-medium">
                                        Status: <span className="text-indigo-600 font-bold">Sedang Dibaca</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const studentId = session?.user?.id ? parseInt(session.user.id, 10) : 0
                                            if (studentId && activeMaterial) {
                                                localStorage.setItem(`elearn_material_read_${studentId}_${activeMaterial.nid}`, 'true')
                                                setReadMaterials(prev => {
                                                    const next = new Set(prev)
                                                    next.add(activeMaterial.nid)
                                                    return next
                                                })
                                            }
                                            toast.success('Hebat! Anda telah menyelesaikan materi ini.')
                                            setActiveMaterial(null)
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5"
                                    >
                                        <Check className="h-4 w-4" />
                                        Tandai Selesai Membaca
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Individual content item row inside a week ---
function WeeklyContentItem({ 
    item, 
    router, 
    moduleId, 
    onViewMaterial,
    completedAttempt,
    isMaterialRead,
    isAssignmentSubmitted
}: { 
    item: ContentItem; 
    router: ReturnType<typeof useRouter>; 
    moduleId: number; 
    onViewMaterial: (m: Material) => void;
    completedAttempt?: StudentQuizAttempt;
    isMaterialRead?: boolean;
    isAssignmentSubmitted?: boolean;
}) {
    const isQuizCompleted = item.type === 'quiz' && !!completedAttempt
    const isMaterialCompleted = item.type === 'material' && !!isMaterialRead
    const isAssignmentCompleted = item.type === 'assignment' && !!isAssignmentSubmitted
    
    const isCompleted = isQuizCompleted || isMaterialCompleted || isAssignmentCompleted

    const typeConfig = {
        material: {
            icon: FileText,
            label: 'Materi',
            bgColor: isMaterialCompleted ? 'bg-emerald-50' : 'bg-purple-50',
            textColor: isMaterialCompleted ? 'text-emerald-600' : 'text-purple-600',
            borderColor: isMaterialCompleted ? 'border-l-emerald-500' : 'border-l-purple-500',
            badgeBg: isMaterialCompleted ? 'bg-emerald-50' : 'bg-purple-50',
            badgeText: isMaterialCompleted ? 'text-emerald-700' : 'text-purple-700',
            btnBg: isMaterialCompleted ? 'bg-emerald-600 hover:bg-emerald-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700',
        },
        assignment: {
            icon: PenLine,
            label: 'Tugas',
            bgColor: isAssignmentCompleted ? 'bg-emerald-50' : 'bg-blue-50',
            textColor: isAssignmentCompleted ? 'text-emerald-600' : 'text-blue-600',
            borderColor: isAssignmentCompleted ? 'border-l-emerald-500' : 'border-l-blue-500',
            badgeBg: isAssignmentCompleted ? 'bg-emerald-50' : 'bg-blue-50',
            badgeText: isAssignmentCompleted ? 'text-emerald-700' : 'text-blue-700',
            btnBg: isAssignmentCompleted ? 'bg-emerald-600 hover:bg-emerald-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700',
        },
        quiz: {
            icon: ClipboardList,
            label: 'Kuis',
            bgColor: isQuizCompleted ? 'bg-emerald-50' : 'bg-amber-50',
            textColor: isQuizCompleted ? 'text-emerald-600' : 'text-amber-600',
            borderColor: isQuizCompleted ? 'border-l-emerald-500' : 'border-l-amber-500',
            badgeBg: isQuizCompleted ? 'bg-emerald-50' : 'bg-amber-50',
            badgeText: isQuizCompleted ? 'text-emerald-700' : 'text-amber-700',
            btnBg: isQuizCompleted ? 'bg-emerald-600 hover:bg-emerald-700 animate-pulse' : 'bg-amber-600 hover:bg-amber-700',
        },
        exam: {
            icon: ClipboardCheck,
            label: 'Ujian',
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-600',
            borderColor: 'border-l-rose-500',
            badgeBg: 'bg-rose-50',
            badgeText: 'text-rose-700',
            btnBg: 'bg-rose-600 hover:bg-rose-700',
        },
    }

    const config = typeConfig[item.type]
    const Icon = config.icon

    // Extract common properties based on type
    let title = ''
    let description = ''
    let metaInfo = ''
    let actionLabel = ''
    let onAction = () => {}
    let showAction = true

    const ASSIGNMENT_API_URL = process.env.NEXT_PUBLIC_ASSIGNMENT_API_URL || 'https://localhost:5005'

    if (item.type === 'material') {
        const m = item.data as Material
        title = m.vtitle
        description = m.vdescription || ''
        if (isMaterialCompleted) {
            metaInfo = 'Materi Sudah Dibaca'
            actionLabel = 'Dibaca ✓'
            if (m.vfile_path) {
                onAction = () => {
                    if (m.vfile_path!.startsWith('/uploads/')) {
                        onViewMaterial(m)
                    } else {
                        const fileUrl = m.vfile_path!.startsWith('http') ? m.vfile_path! : `${ASSIGNMENT_API_URL}${m.vfile_path}`
                        window.open(fileUrl, '_blank')
                    }
                }
            } else {
                showAction = false
            }
        } else if (m.vfile_path) {
            metaInfo = m.vfile_type ? m.vfile_type.toUpperCase() : ''
            actionLabel = 'Buka Materi'
            onAction = () => {
                if (m.vfile_path!.startsWith('/uploads/')) {
                    onViewMaterial(m)
                } else {
                    const fileUrl = m.vfile_path!.startsWith('http') ? m.vfile_path! : `${ASSIGNMENT_API_URL}${m.vfile_path}`
                    window.open(fileUrl, '_blank')
                }
            }
        } else {
            showAction = false
        }
    } else if (item.type === 'assignment') {
        const a = item.data as Assignment
        title = a.title
        description = a.description || ''
        const dueText = a.due_date ? `Deadline: ${new Date(a.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''
        if (isAssignmentCompleted) {
            metaInfo = 'Tugas Sudah Dikumpulkan'
            actionLabel = 'Selesai ✓'
            onAction = () => router.push('/my-assignments')
        } else {
            metaInfo = dueText
            actionLabel = 'Kirim Tugas'
            onAction = () => router.push('/my-assignments')
        }
    } else if (item.type === 'quiz') {
        const q = item.data as Quiz
        title = q.vtitle
        description = q.vdesc || ''
        const canShowScore = q.nshow_results !== 0
        if (completedAttempt) {
            metaInfo = `${q.nduration} Menit • ` + (canShowScore && completedAttempt.nscore !== undefined
                ? `Nilai: ${completedAttempt.nscore}/${q.nmax_score}`
                : `Selesai`)
            actionLabel = canShowScore ? 'Lihat Nilai ✓' : 'Selesai ✓'
            onAction = () => router.push(`/my-modules/${moduleId}/quiz/${q.nid}`)
        } else {
            metaInfo = `${q.nduration} Menit • Passing: ${q.npassing_score || 60}`
            actionLabel = 'Mulai Kuis'
            onAction = () => router.push(`/my-modules/${moduleId}/quiz/${q.nid}`)
        }
    } else if (item.type === 'exam') {
        const e = item.data as Exam
        title = e.vtitle || 'Ujian'
        description = e.vdescription || ''
        metaInfo = `${e.nduration} Menit • ${new Date(e.dstart).toLocaleDateString('id-ID')}`
        actionLabel = 'Mulai Ujian'
        onAction = () => toast.info('Layanan Ujian Siswa akan segera hadir!')
    }

    const formattedDate = item.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

    let badgeLabel = config.label
    if (isMaterialCompleted) badgeLabel = 'Materi Selesai ✓'
    if (isAssignmentCompleted) badgeLabel = 'Tugas Selesai ✓'
    if (isQuizCompleted) badgeLabel = 'Kuis Selesai ✓'

    return (
        <div className={`group flex items-start gap-3 rounded-lg border p-3 transition-all duration-200 hover:shadow-sm ${
            isCompleted 
                ? 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/30 hover:border-emerald-300' 
                : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200'
        } border-l-[3px] ${config.borderColor}`}>
            {/* Icon */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor} ${config.textColor}`}>
                <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`text-[13px] font-bold text-gray-900 line-clamp-1 group-hover:${config.textColor} transition-colors`}>
                                {title}
                            </h4>
                            <span className={`shrink-0 px-1.5 py-0.5 ${config.badgeBg} ${config.badgeText} text-[9px] font-bold rounded-full`}>
                                {badgeLabel}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                            {metaInfo && (
                                <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                                    isCompleted ? 'text-emerald-600' : 'text-gray-400'
                                }`}>
                                    <Clock className="h-2.5 w-2.5" />
                                    {metaInfo}
                                </span>
                            )}
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    {showAction && (
                        <button
                            onClick={onAction}
                            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 ${config.btnBg} text-white text-[10px] font-semibold rounded-lg transition-colors shadow-sm`}
                        >
                            {actionLabel}
                            {item.type === 'material' && !isCompleted ? <ExternalLink className="h-3 w-3" /> : (isCompleted ? <Check className="h-3 w-3" /> : <Play className="h-3 w-3" />)}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
