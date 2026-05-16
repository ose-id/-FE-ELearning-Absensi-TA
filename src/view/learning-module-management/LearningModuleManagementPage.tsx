'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, BookOpen, Filter, X, Key, GraduationCap, ArrowLeft, Users, FileText, ClipboardList, ClipboardCheck, Edit, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { learningModuleService } from '@/services/learning-module.service'
import { materialService } from '@/services/material.service'
import { quizService } from '@/services/quiz.service'
import { examService } from '@/services/exam.service'
import { departmentService } from '@/services/department.service'
import { classService } from '@/services/class.service'
import { subjectService } from '@/services/subject.service'
import { lovService, LOVItem } from '@/services/lov.service'
import { LearningModule, CreateLearningModuleRequest } from '@/types/learning-module'
import { Material } from '@/types/material'
import { Quiz, QuizQuestion } from '@/types/quiz'
import { Exam } from '@/types/exam'
import { Class } from '@/types/class'
import { Subject } from '@/types/subject'
import LearningModuleForm, { LearningModuleFormData } from './LearningModuleForm'
import MaterialList from './MaterialList'
import MaterialForm, { MaterialFormData } from './MaterialForm'
import QuizList from './QuizList'
import QuizForm, { QuizFormData } from './QuizForm'
import ExamForm, { ExamFormData } from './ExamForm'
import QuestionForm, { QuestionFormData } from './QuestionForm'
import EnrollModuleDialog from './EnrollModuleDialog'

/** Extracts a human-readable message from an unknown catch value */
function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

export default function LearningModuleManagementPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<Class[]>([])
    const [modules, setModules] = useState<LearningModule[]>([])
    const [departments, setDepartments] = useState<LOVItem[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [academicYears, setAcademicYears] = useState<LOVItem[]>([])
    const [schoolTerms, setSchoolTerms] = useState<LOVItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState<string>('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)
    const [totalRecords, setTotalRecords] = useState(0)

    // Selected class for detail view
    const [selectedClass, setSelectedClass] = useState<Class | null>(null)
    const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)

    // Materials state
    const [materials, setMaterials] = useState<Material[]>([])
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

    // Quiz state
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
    const [showQuestionForm, setShowQuestionForm] = useState(false)
    const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)

    // Exam state
    const [exams, setExams] = useState<Exam[]>([])
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
    const [isExamFormOpen, setIsExamFormOpen] = useState(false)

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false)
    const [isQuizFormOpen, setIsQuizFormOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Enroll dialog
    const [isEnrollOpen, setIsEnrollOpen] = useState(false)
    const [isEnrolling, setIsEnrolling] = useState(false)

    const userRole = session?.user?.vrole_code?.toUpperCase()
    const isGuru = userRole === 'GR' || userRole === 'GURU' || userRole === 'TEACHER'
    const isAdmin = userRole === 'ADMIN' || userRole === 'ADM'
    const isMurid = userRole === 'MR' || userRole === 'MURID' || userRole === 'STUDENT'
    const canManage = isGuru || isAdmin

    const fetchClasses = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await classService.getClasses(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setClasses(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: unknown) {
            console.error('Failed to fetch classes:', error)
            toast.error(getErrorMessage(error, 'Failed to load classes'))
        } finally {
            setLoading(false)
        }
    }

    const fetchModules = async () => {
        if (!session?.accessToken) return

        try {
            // Only fetch learning modules assigned to this teacher
            const teacherId = parseInt(session.user?.id || '0')
            const response = await learningModuleService.getAllLearningModules(
                session.accessToken,
                1,
                100,
                searchTerm || undefined,
                teacherId
            )
            setModules(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch modules:', error)
        }
    }

    const fetchMaterials = async (learningModuleId: number) => {
        if (!session?.accessToken) return

        try {
            const response = await materialService.getMaterialsByLearningModule(
                learningModuleId,
                session.accessToken
            )
            setMaterials(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch materials:', error)
        }
    }

    const fetchQuizzes = async (learningModuleId: number) => {
        if (!session?.accessToken) return

        try {
            const response = await quizService.getQuizzesByModule(learningModuleId, session.accessToken)
            setQuizzes(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch quizzes:', error)
        }
    }

    const fetchExams = async (learningModuleId: number) => {
        if (!session?.accessToken) return

        try {
            const response = await examService.getExamsByModule(learningModuleId, session.accessToken)
            setExams(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch exams:', error)
        }
    }

    const fetchDepartments = async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getDepartments(session.accessToken)
            setDepartments(response)
        } catch (error: unknown) {
            console.error('Failed to fetch departments:', error)
        }
    }

    const fetchAcademicYears = async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getAcademicYears(session.accessToken)
            setAcademicYears(response)
        } catch (error: unknown) {
            console.error('Failed to fetch academic years:', error)
        }
    }

    const fetchSchoolTerms = async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getSchoolTerms(session.accessToken)
            setSchoolTerms(response)
        } catch (error: unknown) {
            console.error('Failed to fetch school terms:', error)
        }
    }

    const fetchSubjects = async () => {
        if (!session?.accessToken) return
        try {
            const response = await subjectService.getAllSubjects(session.accessToken, 1, 100)
            setSubjects(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch subjects:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchClasses()
            fetchDepartments()
            fetchAcademicYears()
            fetchSchoolTerms()
            if (canManage) {
                fetchSubjects()
            }
        }
    }, [session, currentPage, searchTerm])

    // If a class is selected, fetch modules for that class
    useEffect(() => {
        if (session && selectedClass) {
            fetchModules()
        }
    }, [session, selectedClass])

    const handleClassClick = (cls: Class) => {
        setSelectedClass(cls)
    }

    const handleBackFromClass = () => {
        setSelectedClass(null)
        setSelectedModule(null)
    }

    const handleCreateModule = () => {
        setSelectedModule(null)
        setIsFormOpen(true)
    }

    const handleSelectModule = (module: LearningModule) => {
        setSelectedModule(module)
        fetchMaterials(module.nid)
        fetchQuizzes(module.nid)
        fetchExams(module.nid)
    }

    const handleEditModuleClick = (module: LearningModule) => {
        setSelectedModule(module)
        setIsFormOpen(true)
        fetchMaterials(module.nid)
        fetchQuizzes(module.nid)
        fetchExams(module.nid)
    }

    const handleBackFromModule = () => {
        setSelectedModule(null)
        setMaterials([])
        setQuizzes([])
        setExams([])
    }

    const handleCreateMaterial = () => {
        setSelectedMaterial(null)
        setIsMaterialFormOpen(true)
    }

    const handleEditMaterial = (material: Material) => {
        setSelectedMaterial(material)
        setIsMaterialFormOpen(true)
    }

    const handleCreateQuiz = () => {
        setSelectedQuiz(null)
        setIsQuizFormOpen(true)
    }

    const handleEditQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz)
        setIsQuizFormOpen(true)
    }

    const handleViewQuestions = (quiz: Quiz) => {
        setSelectedQuiz(quiz)
        setShowQuestionForm(true)
        setSelectedQuestion(null)
        setCurrentQuestionNumber(1)
    }

    const handleAddQuestion = () => {
        setSelectedQuestion(null)
        setCurrentQuestionNumber(quizzes.length + 1)
        setShowQuestionForm(true)
    }

    const handleDeleteModule = async (module: LearningModule) => {
        if (!confirm(`Are you sure you want to delete module "${module.vname}"?`)) return

        if (!session?.accessToken) return

        try {
            await learningModuleService.deleteLearningModule(module.nid, session.accessToken)
            toast.success('Learning module deleted successfully')
            fetchModules()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Failed to delete module'))
        }
    }

    const handleDeleteMaterial = async (material: Material) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus materi "${material.vtitle}"?`)) return

        if (!session?.accessToken) return

        try {
            await materialService.deleteMaterial(material.nid, session.accessToken)
            toast.success('Materi berhasil dihapus')
            if (selectedModule) {
                fetchMaterials(selectedModule.nid)
            }
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Gagal menghapus materi'))
        }
    }

    const handleMaterialFormSubmit = async (data: MaterialFormData, file?: File) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedMaterial) {
                // Update existing material
                await materialService.updateMaterial(
                    selectedMaterial.nid,
                    {
                        Title: data.title,
                        Description: data.description,
                    },
                    session.accessToken
                )
                toast.success('Materi berhasil diperbarui')
                if (selectedModule) {
                    fetchMaterials(selectedModule.nid)
                }
            } else {
                // Create new material
                await materialService.createMaterial(
                    {
                        Title: data.title,
                        Description: data.description,
                        LearningModuleId: data.learning_module_id,
                    },
                    session.accessToken
                )
                toast.success('Materi berhasil dibuat')
                if (selectedModule) {
                    fetchMaterials(selectedModule.nid)
                }
            }

            setIsMaterialFormOpen(false)
            setSelectedMaterial(null)
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Gagal menyimpan materi'))
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteQuiz = async (quiz: Quiz) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus quiz "${quiz.vtitle}"?`)) return

        if (!session?.accessToken) return

        try {
            await quizService.deleteQuiz(quiz.nid, session.accessToken)
            toast.success('Quiz berhasil dihapus')
            if (selectedModule) {
                fetchQuizzes(selectedModule.nid)
            }
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Gagal menghapus quiz'))
        }
    }

    const handleDeleteExam = async (exam: Exam) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus ujian "${exam.vtitle}"?`)) return

        if (!session?.accessToken) return

        try {
            await examService.deleteExam(exam.nid, session.accessToken)
            toast.success('Ujian berhasil dihapus')
            if (selectedModule) {
                fetchExams(selectedModule.nid)
            }
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Gagal menghapus ujian'))
        }
    }

    const handleQuizFormSubmit = async (data: QuizFormData) => {
        if (!session?.accessToken || !selectedModule) return

        try {
            setIsSubmitting(true)

            if (selectedQuiz) {
                await quizService.updateQuiz(selectedQuiz.nid, {
                    Title: data.title,
                    Description: data.description,
                    Duration: data.duration,
                    MaxScore: data.max_score,
                    PassingScore: data.passing_score,
                    Status: data.status,
                    StartDate: data.start_date,
                    EndDate: data.end_date,
                }, session.accessToken)
                toast.success('Quiz berhasil diperbarui')
            } else {
                await quizService.createQuiz({
                    Title: data.title,
                    Description: data.description,
                    LearningModuleId: selectedModule.nid,
                    Duration: data.duration,
                    MaxScore: data.max_score,
                    PassingScore: data.passing_score,
                    Status: data.status,
                    StartDate: data.start_date,
                    EndDate: data.end_date,
                }, session.accessToken)
                toast.success('Quiz berhasil dibuat')
            }

            setIsQuizFormOpen(false)
            setSelectedQuiz(null)
            if (selectedModule) {
                fetchQuizzes(selectedModule.nid)
            }
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Gagal menyimpan quiz'))
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleExamFormSubmit = async (data: ExamFormData) => {
        if (!session?.accessToken || !selectedModule) return

        try {
            setIsSubmitting(true)

            if (selectedExam) {
                await examService.updateExam(selectedExam.nid, {
                    Title: data.title,
                    Description: data.description,
                    Duration: data.duration,
                    PassGrade: data.pass_grade,
                    StartDate: data.start_date,
                    EndDate: data.end_date,
                    ShowResults: data.show_results,
                    Fullscreen: data.fullscreen,
                    Cutoff: data.cutoff,
                    Status: data.status,
                }, session.accessToken)
                toast.success('Ujian berhasil diperbarui')
            } else {
                await examService.createExam({
                    LearningModuleId: selectedModule.nid,
                    Title: data.title,
                    Description: data.description,
                    Duration: data.duration,
                    PassGrade: data.pass_grade,
                    StartDate: data.start_date || new Date().toISOString(),
                    EndDate: data.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    ShowResults: data.show_results,
                    Fullscreen: data.fullscreen,
                    Cutoff: data.cutoff,
                    Status: data.status,
                }, session.accessToken)
                toast.success('Ujian berhasil dibuat')
            }

            setIsExamFormOpen(false)
            setSelectedExam(null)
            if (selectedModule) {
                fetchExams(selectedModule.nid)
            }
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Gagal menyimpan ujian'))
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleQuestionFormSubmit = async (data: QuestionFormData) => {
        if (!session?.accessToken || !selectedQuiz) return

        try {
            setIsSubmitting(true)

            const optionsStr = data.options ? JSON.stringify(data.options) : undefined

            if (selectedQuestion) {
                await quizService.updateQuestion(selectedQuestion.nid, {
                    Order: data.points,
                    Question: data.question,
                    Type: data.type,
                    Points: data.points,
                    AnswerKey: data.answer_key,
                    Options: optionsStr,
                }, session.accessToken)
                toast.success('Pertanyaan berhasil diperbarui')
            } else {
                await quizService.createQuestion({
                    QuizId: selectedQuiz.nid,
                    Order: currentQuestionNumber,
                    Question: data.question,
                    Type: data.type,
                    Points: data.points,
                    AnswerKey: data.answer_key,
                    Options: optionsStr,
                }, session.accessToken)
                toast.success('Pertanyaan berhasil ditambahkan')
            }

            setShowQuestionForm(false)
            setSelectedQuestion(null)
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Gagal menyimpan pertanyaan'))
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFormSubmit = async (data: LearningModuleFormData) => {
        if (!session?.accessToken || !selectedClass) return

        try {
            setIsSubmitting(true)

            if (selectedModule) {
                await learningModuleService.updateLearningModule(
                    selectedModule.nid,
                    {
                        ModuleName: data.module_name,
                        Description: data.description,
                        ClassId: selectedClass.nid,
                        DepartmentId: data.department_id,
                        SubjectId: data.subject_id,
                        AcademicYearId: data.academic_year_id,
                        SchoolTermId: data.school_term_id,
                    },
                    session.accessToken
                )
                toast.success('Learning module updated successfully')
            } else {
                const teacherId = parseInt(session?.user?.id || '0')
                const payload: CreateLearningModuleRequest = {
                    ModuleName: data.module_name,
                    Description: data.description,
                    ClassId: selectedClass.nid,
                    DepartmentId: data.department_id,
                    SubjectId: data.subject_id,
                    AcademicYearId: data.academic_year_id,
                    SchoolTermId: data.school_term_id,
                    // Sending both to be safe, as some backend versions use NidTeacher
                    TeacherId: teacherId,
                    NidTeacher: teacherId
                }

                console.log('Creating LearningModule with:', payload)
                await learningModuleService.createLearningModule(payload, session.accessToken)
                toast.success('Learning module created successfully')
            }

            setIsFormOpen(false)
            fetchModules()
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Failed to save module'))
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEnroll = async (token: string) => {
        if (!session?.accessToken) return

        try {
            setIsEnrolling(true)
            await learningModuleService.enrollToLearningModule(
                { EnrollmentToken: token },
                session.accessToken
            )
            toast.success('Successfully enrolled to module!')
            setIsEnrollOpen(false)
            fetchModules()
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Failed to enroll'))
            throw error
        } finally {
            setIsEnrolling(false)
        }
    }

    // Filter modules by selected class and sort by creation date (oldest first)
    const classModules = modules
        .filter(m => m.nid_class === selectedClass?.nid)
        .sort((a, b) => {
            const dateA = a.dcrea ? new Date(a.dcrea).getTime() : 0
            const dateB = b.dcrea ? new Date(b.dcrea).getTime() : 0
            return dateA - dateB
        })

    const getAcademicYearLabel = (module: LearningModule) => {
        const ay = module.AcademicYear || module.academicYear
        if (ay?.vyear) return ay.vyear
        if (ay?.vacademic_year_name) return ay.vacademic_year_name
        const ayId = module.nid_academic_year || module.academic_year_id
        if (ayId) {
            const found = academicYears.find(y => y.nid === ayId)
            if (found) return found.label
        }
        return '-'
    }

    const getSchoolTermLabel = (module: LearningModule) => {
        const st = module.SchoolTerm || module.schoolTerm
        if (st?.vname) return st.vname
        if (st?.vterm_name) return st.vterm_name
        const stId = module.nid_school_term || module.school_term_id
        if (stId) {
            const found = schoolTerms.find(t => t.nid === stId)
            if (found) return found.label
        }
        return '-'
    }

    const filteredClasses = classes.filter((cls) => {
        const term = searchTerm.toLowerCase().trim()

        if (departmentFilter !== 'All') {
            if (cls.nid_department?.toString() !== departmentFilter) return false
        }

        if (!term) return true

        const name = cls.vname?.toLowerCase() || ''
        const description = cls.vdesc?.toLowerCase() || ''

        return name.includes(term) || description.includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    // If a class is selected, show class detail with modules
    if (selectedClass) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={handleBackFromClass} className="p-2 hover:bg-white rounded-lg transition-colors" title="Kembali">
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedClass.vname}</h2>
                                <p className="text-sm text-gray-500">
                                    {selectedClass.Department?.vdepartment_name || selectedClass.vdesc || `Dept ${selectedClass.nid_department}`} • {classModules.length} Modul
                                </p>
                            </div>
                        </div>
                        {canManage && (
                            <Button onClick={handleCreateModule} size="sm">
                                <Plus className="mr-1 h-4 w-4" /> Tambah Modul
                            </Button>
                        )}
                    </div>

                    {/* Split Panel Layout */}
                    <div className="flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
                        {/* LEFT: Module List Sidebar */}
                        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-700">Daftar Modul</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {classModules.length === 0 ? (
                                    <div className="text-center py-8 px-4">
                                        <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">Belum ada modul</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {classModules.map((module) => {
                                            const subj = module.Subject || module.subject
                                            const isActive = selectedModule?.nid === module.nid
                                            return (
                                                <div key={module.nid} onClick={() => handleSelectModule(module)}
                                                    className={`px-4 py-3 cursor-pointer transition-all ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{module.vname}</p>
                                                            <div className="flex flex-col mt-0.5">
                                                                <p className="text-xs text-gray-500">{subj?.vsubject_name || `Mapel ${module.nid_subject}`}</p>
                                                                <p className="text-[10px] text-gray-400">
                                                                    {getAcademicYearLabel(module)} • {getSchoolTermLabel(module)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${module.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {module.nstatus === 1 ? 'Aktif' : 'Off'}
                                                        </span>
                                                    </div>
                                                    {canManage && (
                                                        <div className="flex gap-1 mt-2">
                                                            <button onClick={(e) => { e.stopPropagation(); handleEditModuleClick(module) }} className="p-1 text-blue-500 hover:bg-blue-100 rounded" title="Edit"><Edit className="h-3 w-3" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(module) }} className="p-1 text-red-500 hover:bg-red-100 rounded" title="Hapus"><Trash2 className="h-3 w-3" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Module Detail Panel */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                            {selectedModule ? (<>
                                {/* Module Info Header */}
                                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{selectedModule.vname}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {(selectedModule.Subject || selectedModule.subject)?.vsubject_name || `Mapel ${selectedModule.nid_subject}`} • {(selectedModule.Class || selectedModule.class)?.vname || `Kelas ${selectedModule.nid_class}`}
                                            </p>
                                        </div>
                                        {canManage && (
                                            <div className="flex gap-2">
                                                <Button onClick={handleCreateMaterial} size="sm" variant="outline" className="text-xs h-8"><FileText className="mr-1 h-3 w-3" /> + Materi</Button>
                                                <Button onClick={handleCreateQuiz} size="sm" variant="outline" className="text-xs h-8 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"><ClipboardList className="mr-1 h-3 w-3" /> + Quiz</Button>
                                                <Button onClick={() => { setSelectedExam(null); setIsExamFormOpen(true) }} size="sm" variant="outline" className="text-xs h-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"><ClipboardCheck className="mr-1 h-3 w-3" /> + Ujian</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Content: Materials, Quiz & Exam */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-100 overflow-hidden">
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><FileText className="h-4 w-4 text-blue-500" /> Materi</h4>
                                            <span className="text-xs text-gray-400">{materials.length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3">
                                            {materials.length === 0 ? (
                                                <div className="text-center py-8"><FileText className="h-8 w-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-gray-400">Belum ada materi</p></div>
                                            ) : (<MaterialList materials={materials} onEdit={handleEditMaterial} onDelete={handleDeleteMaterial} isEditable={canManage} />)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><ClipboardList className="h-4 w-4 text-purple-500" /> Quiz</h4>
                                            <span className="text-xs text-gray-400">{quizzes.length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3">
                                            {quizzes.length === 0 ? (
                                                <div className="text-center py-8"><ClipboardList className="h-8 w-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-gray-400">Belum ada quiz</p></div>
                                            ) : (<QuizList quizzes={quizzes} onEdit={handleEditQuiz} onDelete={handleDeleteQuiz} onViewQuestions={handleViewQuestions} isEditable={canManage} />)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4 text-red-500" /> Ujian</h4>
                                            <span className="text-xs text-gray-400">{exams.length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3">
                                            {exams.length === 0 ? (
                                                <div className="text-center py-8"><ClipboardCheck className="h-8 w-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-gray-400">Belum ada ujian</p></div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {exams.map(exam => (
                                                        <div key={exam.nid} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-medium text-sm text-gray-900">{exam.vtitle}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{exam.nduration} menit</p>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded text-xs ${exam.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                    {exam.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                                                                </span>
                                                            </div>
                                                            {canManage && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <button onClick={() => setSelectedExam(exam)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                                                    <button onClick={() => handleDeleteExam(exam)} className="text-xs text-red-600 hover:underline">Hapus</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 text-lg font-medium">Pilih modul</p>
                                        <p className="text-gray-300 text-sm mt-1">Klik modul di sebelah kiri untuk melihat detail</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Dialog Learning Module */}
                    {canManage && (
                        <LearningModuleForm
                            open={isFormOpen}
                            onOpenChange={setIsFormOpen}
                            onSubmit={handleFormSubmit}
                            initialData={selectedModule}
                            isSubmitting={isSubmitting}
                            departments={departments}
                            classes={[selectedClass]}
                            subjects={subjects}
                        />
                    )}

                    {/* Form Dialog Material */}
                    {canManage && (
                        <MaterialForm
                            open={isMaterialFormOpen}
                            onOpenChange={setIsMaterialFormOpen}
                            onSubmit={handleMaterialFormSubmit}
                            initialData={selectedMaterial}
                            isSubmitting={isSubmitting}
                            learningModules={classModules}
                        />
                    )}

                    {/* Form Dialog Quiz */}
                    {canManage && (
                        <QuizForm
                            open={isQuizFormOpen}
                            onOpenChange={setIsQuizFormOpen}
                            onSubmit={handleQuizFormSubmit}
                            initialData={selectedQuiz}
                            isSubmitting={isSubmitting}
                            learningModules={classModules}
                        />
                    )}

                    {/* Form Dialog Exam */}
                    {canManage && (
                        <ExamForm
                            open={isExamFormOpen}
                            onOpenChange={setIsExamFormOpen}
                            onSubmit={handleExamFormSubmit}
                            initialData={selectedExam}
                            isSubmitting={isSubmitting}
                            learningModules={classModules}
                            selectedModuleId={selectedModule?.nid}
                        />
                    )}

                    {/* Form Dialog Question */}
                    {canManage && selectedQuiz && (
                        <QuestionForm
                            open={showQuestionForm}
                            onOpenChange={setShowQuestionForm}
                            onSubmit={handleQuestionFormSubmit}
                            initialData={selectedQuestion}
                            isSubmitting={isSubmitting}
                            questionNumber={currentQuestionNumber}
                        />
                    )}
                </div>
            </div>
        )
    }

    // Default: Show class list
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Statistics Cards - Pembelajaran */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Materi</p>
                                <p className="text-3xl font-bold text-gray-900">{modules.length}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                                <BookOpen className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Tugas</p>
                                <p className="text-3xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                                <ClipboardList className="h-7 w-7 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Quiz</p>
                                <p className="text-3xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                                <FileText className="h-7 w-7 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Ujian</p>
                                <p className="text-3xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                                <ClipboardCheck className="h-7 w-7 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-1">
                                <Search className="h-5 w-5 text-gray-500" />
                                <Input
                                    className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    placeholder="Cari kelas..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setCurrentPage(1)
                                    }}
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
                                    Menampilkan <span className="font-semibold text-gray-900">{filteredClasses.length}</span> kelas
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Class Grid */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading classes...</p>
                                </div>
                            </div>
                        ) : filteredClasses.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">No classes found</p>
                                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredClasses.map((cls) => {
                                    const moduleCount = modules.filter(m => m.nid_class === cls.nid).length
                                    return (
                                        <div
                                            key={cls.nid}
                                            onClick={() => handleClassClick(cls)}
                                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1"
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                    <BookOpen className="h-3 w-3" />
                                                    {moduleCount} Modules
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {cls.vname}
                                                    </h3>
                                                    <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                        {(() => {
                                                            if (cls.Department?.vdepartment_name) return cls.Department.vdepartment_name;
                                                            const dept = departments.find(d => d.nid === cls.nid_department);
                                                            return dept?.label || `Dept ${cls.nid_department}`;
                                                        })()}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                                                    {cls.vdesc || 'No description available'}
                                                </p>

                                                <div className="pt-3 border-t border-gray-100">
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        Click to view modules →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {!loading && totalRecords > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}

                <EnrollModuleDialog
                    open={isEnrollOpen}
                    onOpenChange={setIsEnrollOpen}
                    onEnroll={handleEnroll}
                    isEnrolling={isEnrolling}
                />
            </div>
        </div>
    )
}