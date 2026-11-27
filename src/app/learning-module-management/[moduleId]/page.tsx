'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, BookOpen, FileText, ClipboardList, ClipboardCheck, Copy, Check, FileQuestion, PenLine, Trash2, CalendarCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import { learningModuleService } from '@/services/learning-module.service'
import { materialService } from '@/services/material.service'
import { quizService } from '@/services/quiz.service'
import { examService } from '@/services/exam.service'
import { assignmentService } from '@/services/assignment.service'
import { LearningModule } from '@/types/learning-module'
import { Material } from '@/types/material'
import { Quiz } from '@/types/quiz'
import { Exam } from '@/types/exam'
import { Assignment } from '@/types/assignment'

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

type ContentItem = {
    id: number
    type: 'material' | 'quiz' | 'exam' | 'assignment'
    title: string
    status: number
}

export default function ModuleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)

    const [module, setModule] = useState<LearningModule | null>(null)
    const [materials, setMaterials] = useState<Material[]>([])
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [exams, setExams] = useState<Exam[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedToken, setCopiedToken] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>('all')

    useEffect(() => {
        if (session?.accessToken) {
            fetchModule()
            fetchMaterials()
            fetchQuizzes()
            fetchExams()
            fetchAssignments()
        }
    }, [session?.accessToken, moduleId])

    const fetchModule = async () => {
        if (!session?.accessToken) return
        try {
            console.log('Fetching module with ID:', moduleId)
            // Use getAllLearningModules with teacherId to get modules accessible to this teacher
            const teacherId = parseInt(session.user?.id || '0')
            const response = await learningModuleService.getAllLearningModules(
                session.accessToken,
                1,
                100,
                undefined,
                teacherId
            )
            console.log('All modules response:', response)
            const foundModule = response.data.find(m => m.nid === moduleId)
            console.log('Found module:', foundModule)
            setModule(foundModule || null)
        } catch (error) {
            console.error('Failed to fetch module:', error)
            setModule(null)
        }
    }

    const fetchMaterials = async () => {
        if (!session?.accessToken) return
        try {
            const response = await materialService.getMaterialsByLearningModule(moduleId, session.accessToken)
            setMaterials(response.data)
        } catch (error) {
            console.error('Failed to fetch materials:', error)
        }
    }

    const fetchQuizzes = async () => {
        if (!session?.accessToken) return
        try {
            const response = await quizService.getQuizzesByModule(moduleId, session.accessToken)
            setQuizzes(response.data)
        } catch (error) {
            console.error('Failed to fetch quizzes:', error)
        }
    }

    const fetchExams = async () => {
        if (!session?.accessToken) return
        try {
            const response = await examService.getExamsByModule(moduleId, session.accessToken)
            setExams(response.data)
        } catch (error) {
            console.error('Failed to fetch exams:', error)
        }
    }

    const fetchAssignments = async () => {
        if (!session?.accessToken) return
        try {
            const response = await assignmentService.getAssignments(session.accessToken)
            const filtered = response.data?.filter((a: Assignment) => a.learning_module_id === moduleId) || []
            setAssignments(filtered)
        } catch (error) {
            console.error('Failed to fetch assignments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyToken = () => {
        if (module?.venrollment_token) {
            navigator.clipboard.writeText(module.venrollment_token)
            setCopiedToken(module.venrollment_token)
            setTimeout(() => setCopiedToken(null), 2000)
        }
    }

    const handleDeleteMaterial = async (material: Material) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus materi "${material.vtitle}"?`)) return
        if (!session?.accessToken) return
        try {
            await materialService.deleteMaterial(material.nid, session.accessToken)
            toast.success('Materi berhasil dihapus')
            fetchMaterials()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menghapus materi'))
        }
    }

    const handleDeleteQuiz = async (quiz: Quiz) => {
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

    const handleDeleteExam = async (exam: Exam) => {
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

    const handleDeleteAssignment = async (assignment: Assignment) => {
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

    const canManage = session?.user?.vrole_code === 'GR'

    const moduleClass = module?.Class || module?.class
    const moduleSubject = module?.Subject || module?.subject

    const handleAddMaterial = () => {
        router.push(`/learning-module-management/${moduleId}/materials`)
    }

    const handleAddAssignment = () => {
        router.push(`/learning-module-management/${moduleId}/assignments`)
    }

    const handleAddQuiz = () => {
        router.push(`/learning-module-management/${moduleId}/quizzes`)
    }

    const handleAddExam = () => {
        router.push(`/learning-module-management/${moduleId}/exams`)
    }

    const handleAttendance = () => {
        router.push(`/learning-module-management/${moduleId}/attendance`)
    }

    const allContent: ContentItem[] = [
        ...materials.map(m => ({ id: m.nid, type: 'material' as const, title: m.vtitle, status: m.nstatus })),
        ...quizzes.map(q => ({ id: q.nid, type: 'quiz' as const, title: q.vtitle, status: q.nstatus })),
        ...exams.map(e => ({ id: e.nid, type: 'exam' as const, title: e.vtitle || 'Exam', status: e.nstatus })),
        ...assignments.map(a => ({ id: a.id, type: 'assignment' as const, title: a.title, status: 1 }))
    ]

    const filteredContent = activeTab === 'all'
        ? allContent
        : allContent.filter(item => item.type === activeTab)

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'material': return { icon: FileText, bg: 'bg-blue-50', text: 'text-blue-600', label: 'Material' }
            case 'quiz': return { icon: ClipboardList, bg: 'bg-purple-50', text: 'text-purple-600', label: 'Quiz' }
            case 'exam': return { icon: ClipboardCheck, bg: 'bg-red-50', text: 'text-red-600', label: 'Exam' }
            case 'assignment': return { icon: PenLine, bg: 'bg-green-50', text: 'text-green-600', label: 'Assignment' }
            default: return { icon: FileQuestion, bg: 'bg-gray-50', text: 'text-gray-600', label: 'Other' }
        }
    }

    const tabs = [
        { key: 'all', label: 'Semua', count: allContent.length },
        { key: 'material', label: 'Materi', count: materials.length },
        { key: 'quiz', label: 'Quiz', count: quizzes.length },
        { key: 'exam', label: 'Ujian', count: exams.length },
        { key: 'assignment', label: 'Tugas', count: assignments.length },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <div className="p-6 relative">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => router.push('/learning-module-management')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                                    title="Kembali"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900">{module.vname}</h1>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            module.nstatus === 1
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {module.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{moduleSubject?.vsubject_name || `Mapel ${module.nid_subject}`}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" />
                                            <span>{moduleClass?.vname || `Kelas ${module.nid_class}`}</span>
                                        </div>
                                        {module.venrollment_token && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-500">Token:</span>
                                                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                                                    {module.venrollment_token}
                                                </code>
                                                <button
                                                    onClick={handleCopyToken}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    title="Copy token"
                                                >
                                                    {copiedToken === module.venrollment_token ? (
                                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {module.vdesc && (
                                        <p className="mt-3 text-sm text-gray-500 max-w-2xl">{module.vdesc}</p>
                                    )}
                                    {canManage && (
                                        <div className="mt-4 md:mt-0 md:absolute md:bottom-6 md:right-6">
                                            <Button
                                                onClick={handleAttendance}
                                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                size="sm"
                                            >
                                                <CalendarCheck className="mr-2 h-4 w-4" />
                                                Absensi
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid with Add Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard
                        icon={Users}
                        color="gray"
                        label="Total Students"
                        value={0}
                        description="Student Enrolled"
                        canAdd={false}
                    />
                    <StatCard
                        icon={FileText}
                        color="blue"
                        label="Material"
                        value={materials.length}
                        description="Available Materials"
                        canAdd={canManage}
                        onAdd={handleAddMaterial}
                    />
                    <StatCard
                        icon={PenLine}
                        color="green"
                        label="Assignment"
                        value={assignments.length}
                        description="Available Assignments"
                        canAdd={canManage}
                        onAdd={handleAddAssignment}
                    />
                    <StatCard
                        icon={ClipboardList}
                        color="purple"
                        label="Quiz"
                        value={quizzes.length}
                        description="Available Quiz"
                        canAdd={canManage}
                        onAdd={handleAddQuiz}
                    />
                    <StatCard
                        icon={ClipboardCheck}
                        color="red"
                        label="Exam"
                        value={exams.length}
                        description="Available Exams"
                        canAdd={canManage}
                        onAdd={handleAddExam}
                    />
                </div>

                {/* Unified Content List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">


                    {/* Content List */}
                    <div className="p-6">
                        {filteredContent.length === 0 ? (
                            <div className="text-center py-12">
                                <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No content yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredContent.map((item) => {
                                    const typeInfo = getTypeIcon(item.type)
                                    const Icon = typeInfo.icon
                                    return (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                                                    <Icon className={`h-4 w-4 ${typeInfo.text}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.title}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    item.status === 1
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {item.status === 1 ? 'Aktif' : 'Nonaktif'}
                                                </span>

                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>
    color: 'blue' | 'green' | 'purple' | 'red' | 'gray' | 'orange'
    label: string
    value: number | string
    description: string
    canAdd?: boolean
    onAdd?: () => void
}

function StatCard({ icon: Icon, color, label, value, description, canAdd, onAdd }: StatCardProps) {
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100', border: 'border-blue-200' },
        green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100', border: 'border-green-200' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100', border: 'border-purple-200' },
        red: { bg: 'bg-red-50', text: 'text-red-600', hover: 'hover:bg-red-100', border: 'border-red-200' },
        gray: { bg: 'bg-gray-50', text: 'text-gray-600', hover: 'hover:bg-gray-100', border: 'border-gray-200' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100', border: 'border-orange-200' }
    }
    const colors = colorMap[color]

    return (
        <div className={`bg-white rounded-xl border ${colors.border} shadow-sm p-5 hover:shadow-md transition-all relative ${canAdd ? 'cursor-pointer' : ''}`}
             onClick={canAdd && onAdd ? onAdd : undefined}>
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{value}</span>
            </div>
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{description}</p>

            {/* Add Button */}
            {canAdd && onAdd && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onAdd()
                    }}
                    className={`absolute bottom-3 right-3 p-1.5 rounded-full ${colors.bg} ${colors.text} ${colors.hover} transition-colors`}
                    title={`Tambah ${label}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            )}
        </div>
    )
}
