'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2, BookOpen, ArrowLeft, Edit, Trash2, Plus, Search, X, FileText, ClipboardList, ClipboardCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { learningModuleService } from '@/services/learning-module.service'
import { materialService } from '@/services/material.service'
import { quizService } from '@/services/quiz.service'
import { examService } from '@/services/exam.service'
import { classService } from '@/services/class.service'
import { subjectService } from '@/services/subject.service'
import { lovService, LOVItem } from '@/services/lov.service'
import { LearningModule } from '@/types/learning-module'
import { Material } from '@/types/material'
import { Quiz, QuizQuestion } from '@/types/quiz'
import { Exam } from '@/types/exam'
import { Assignment } from '@/types/assignment'
import { Class } from '@/types/class'
import { Subject } from '@/types/subject'
import { assignmentService } from '@/services/assignment.service'
import LearningModuleForm, { LearningModuleFormData } from './LearningModuleForm'
import MaterialList from './MaterialList'
import MaterialForm, { MaterialFormData } from './MaterialForm'
import QuizList from './QuizList'
import QuizForm, { QuizFormData } from './QuizForm'
import ExamForm, { ExamFormData } from './ExamForm'
import QuestionForm, { QuestionFormData } from './QuestionForm'
import EnrollModuleDialog from './EnrollModuleDialog'
import LearningModuleGrid from './LearningModuleGrid'
import LearningModuleDetail from './LearningModuleDetail'

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
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)
    const [totalRecords, setTotalRecords] = useState(0)

    const [selectedClass, setSelectedClass] = useState<Class | null>(null)
    const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
    const [editingModule, setEditingModule] = useState<LearningModule | null>(null)

    const [materials, setMaterials] = useState<Material[]>([])
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
    const [showQuestionForm, setShowQuestionForm] = useState(false)
    const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)

    const [exams, setExams] = useState<Exam[]>([])
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
    const [isExamFormOpen, setIsExamFormOpen] = useState(false)

    // Assignment state
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
    const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false)
    const [isQuizFormOpen, setIsQuizFormOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isEnrollOpen, setIsEnrollOpen] = useState(false)
    const [isEnrolling, setIsEnrolling] = useState(false)
    const [copiedToken, setCopiedToken] = useState<string | null>(null)

    const userRole = session?.user?.vrole_code?.toUpperCase()
    const isGuru = userRole === 'GR' || userRole === 'GURU' || userRole === 'TEACHER'
    const isAdmin = userRole === 'ADMIN' || userRole === 'ADM'
    const canManage = isGuru || isAdmin

    const fetchClasses = useCallback(async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await classService.getClasses(session.accessToken, currentPage, itemsPerPage, searchTerm || undefined)
            setClasses(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: unknown) {
            console.error('Failed to fetch classes:', error)
            toast.error(getErrorMessage(error, 'Failed to load classes'))
        } finally {
            setLoading(false)
        }
    }, [session?.accessToken, currentPage, itemsPerPage, searchTerm])

    const fetchModules = useCallback(async () => {
        if (!session?.accessToken) return
        try {
            const response = await learningModuleService.getAllLearningModules(session.accessToken, 1, 100)
            setModules(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch modules:', error)
        }
    }, [session?.accessToken])

    const fetchMaterials = useCallback(async (learningModuleId: number) => {
        if (!session?.accessToken) return
        try {
            const response = await materialService.getMaterialsByLearningModule(learningModuleId, session.accessToken)
            setMaterials(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch materials:', error)
        }
    }, [session?.accessToken])

    const fetchQuizzes = useCallback(async (learningModuleId: number) => {
        if (!session?.accessToken) return
        try {
            const response = await quizService.getQuizzesByModule(learningModuleId, session.accessToken)
            setQuizzes(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch quizzes:', error)
        }
    }, [session?.accessToken])

    const fetchExams = useCallback(async (learningModuleId: number) => {
        if (!session?.accessToken) return
        try {
            const response = await examService.getExamsByModule(learningModuleId, session.accessToken)
            setExams(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch exams:', error)
        }
    }, [session?.accessToken])

    const fetchAssignments = useCallback(async (learningModuleId: number) => {
        if (!session?.accessToken) return
        try {
            const response = await assignmentService.getAssignments(session.accessToken)
            // Filter assignments by learning_module_id
            const filtered = response.data?.filter(a => a.learning_module_id === learningModuleId) || []
            setAssignments(filtered)
        } catch (error: unknown) {
            console.error('Failed to fetch assignments:', error)
        }
    }, [session?.accessToken])

    const fetchDepartments = useCallback(async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getDepartments(session.accessToken)
            setDepartments(response)
        } catch (error: unknown) {
            console.error('Failed to fetch departments:', error)
        }
    }, [session?.accessToken])

    const fetchAcademicYears = useCallback(async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getAcademicYears(session.accessToken)
            setAcademicYears(response)
        } catch (error: unknown) {
            console.error('Failed to fetch academic years:', error)
        }
    }, [session?.accessToken])

    const fetchSchoolTerms = useCallback(async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getSchoolTerms(session.accessToken)
            setSchoolTerms(response)
        } catch (error: unknown) {
            console.error('Failed to fetch school terms:', error)
        }
    }, [session?.accessToken])

    const fetchSubjects = useCallback(async () => {
        if (!session?.accessToken) return
        try {
            const response = await subjectService.getAllSubjects(session.accessToken, 1, 100)
            setSubjects(response.data)
        } catch (error: unknown) {
            console.error('Failed to fetch subjects:', error)
        }
    }, [session?.accessToken])

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
    }, [session, currentPage, searchTerm, canManage, fetchClasses, fetchDepartments, fetchAcademicYears, fetchSchoolTerms, fetchSubjects])

    useEffect(() => {
        if (session && selectedClass) {
            fetchModules()
        }
    }, [session, selectedClass, fetchModules])

    useEffect(() => {
        if (session && isGuru) {
            fetchModules()
        }
    }, [session, isGuru, fetchModules])

    const handleClassClick = (cls: Class) => setSelectedClass(cls)
    const handleBackFromClass = () => {
        setSelectedClass(null)
        setSelectedModule(null)
    }

    const handleCreateModule = () => {
        setSelectedModule(null)
        setEditingModule(null)
        setIsFormOpen(true)
    }

    const handleFormOpenChange = (open: boolean) => {
        setIsFormOpen(open)
        if (!open) {
            setEditingModule(null)
        }
    }

    const handleSelectModule = (module: LearningModule) => {
        setSelectedModule(module)
        fetchMaterials(module.nid)
        fetchQuizzes(module.nid)
        fetchExams(module.nid)
        fetchAssignments(module.nid)
    }

    const handleEditModuleClick = (module: LearningModule) => {
        // Use separate state for editing to avoid navigating to detail
        setEditingModule(module)
        setIsFormOpen(true)
    }

    const handleBackFromModule = () => {
        setSelectedModule(null)
        setMaterials([])
        setQuizzes([])
        setExams([])
        setAssignments([])
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
        if (!confirm(`Are you sure you want to delete material "${material.vtitle}"?`)) return
        if (!session?.accessToken) return
        try {
            await materialService.deleteMaterial(material.nid, session.accessToken)
            toast.success('Material deleted successfully')
            if (selectedModule) fetchMaterials(selectedModule.nid)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Failed to delete material'))
        }
    }

    const handleMaterialFormSubmit = async (data: MaterialFormData) => {
        if (!session?.accessToken) return
        try {
            setIsSubmitting(true)
            if (selectedMaterial) {
                await materialService.updateMaterial(selectedMaterial.nid, { Title: data.title, Description: data.description }, session.accessToken)
                toast.success('Material updated successfully')
                if (selectedModule) fetchMaterials(selectedModule.nid)
            } else {
                await materialService.createMaterial({ Title: data.title, Description: data.description, LearningModuleId: data.learning_module_id }, session.accessToken)
                toast.success('Material created successfully')
                if (selectedModule) fetchMaterials(selectedModule.nid)
            }
            setIsMaterialFormOpen(false)
            setSelectedMaterial(null)
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Failed to save material'))
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteQuiz = async (quiz: Quiz) => {
        if (!confirm(`Are you sure you want to delete quiz "${quiz.vtitle}"?`)) return
        if (!session?.accessToken) return
        try {
            await quizService.deleteQuiz(quiz.nid, session.accessToken)
            toast.success('Quiz deleted successfully')
            if (selectedModule) fetchQuizzes(selectedModule.nid)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Failed to delete quiz'))
        }
    }

    const handleDeleteExam = async (exam: Exam) => {
        if (!confirm(`Are you sure you want to delete exam "${exam.vtitle}"?`)) return
        if (!session?.accessToken) return
        try {
            await examService.deleteExam(exam.nid, session.accessToken)
            toast.success('Exam deleted successfully')
            if (selectedModule) fetchExams(selectedModule.nid)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Failed to delete exam'))
        }
    }

    const handleQuizFormSubmit = async (data: QuizFormData) => {
        if (!session?.accessToken || !selectedModule) return
        try {
            setIsSubmitting(true)
            if (selectedQuiz) {
                await quizService.updateQuiz(selectedQuiz.nid, {
                    Title: data.title, Description: data.description, Duration: data.duration,
                    MaxScore: data.max_score, PassingScore: data.passing_score, Status: data.status,
                    StartDate: data.start_date, EndDate: data.end_date,
                }, session.accessToken)
                toast.success('Quiz updated successfully')
            } else {
                await quizService.createQuiz({
                    Title: data.title, Description: data.description, LearningModuleId: selectedModule.nid,
                    Duration: data.duration, MaxScore: data.max_score, PassingScore: data.passing_score,
                    Status: data.status, StartDate: data.start_date, EndDate: data.end_date,
                }, session.accessToken)
                toast.success('Quiz created successfully')
            }
            setIsQuizFormOpen(false)
            setSelectedQuiz(null)
            if (selectedModule) fetchQuizzes(selectedModule.nid)
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Failed to save quiz'))
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
                    nid_learning_module: selectedModule.nid,
                    vtitle: data.title,
                    vdescription: data.description,
                    nduration: data.duration,
                    npass_grade: data.pass_grade,
                    dstart: data.start_date || '',
                    dend: data.end_date || '',
                    nshow_results: data.show_results,
                    nfullscreen: data.fullscreen,
                    ncutoff: data.cutoff,
                    nstatus: data.status,
                }, session.accessToken)
                toast.success('Exam updated successfully')
            } else {
                await examService.createExam({
                    nid_learning_module: selectedModule.nid,
                    vtitle: data.title,
                    vdescription: data.description,
                    nduration: data.duration,
                    npass_grade: data.pass_grade,
                    dstart: data.start_date || new Date().toISOString(),
                    dend: data.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    nshow_results: data.show_results,
                    nfullscreen: data.fullscreen,
                    ncutoff: data.cutoff,
                    nstatus: data.status,
                }, session.accessToken)
                toast.success('Exam created successfully')
            }
            setIsExamFormOpen(false)
            setSelectedExam(null)
            if (selectedModule) fetchExams(selectedModule.nid)
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Failed to save exam'))
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
                    Order: data.points, Question: data.question, Type: data.type,
                    Points: data.points, AnswerKey: data.answer_key, Options: optionsStr,
                }, session.accessToken)
                toast.success('Question updated successfully')
            } else {
                await quizService.createQuestion({
                    QuizId: selectedQuiz.nid, Order: currentQuestionNumber, Question: data.question,
                    Type: data.type, Points: data.points, AnswerKey: data.answer_key, Options: optionsStr,
                }, session.accessToken)
                toast.success('Question added successfully')
            }
            setShowQuestionForm(false)
            setSelectedQuestion(null)
        } catch (error: unknown) {
            console.error(error)
            toast.error(getErrorMessage(error, 'Failed to save question'))
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFormSubmit = async (data: LearningModuleFormData) => {
        if (!session?.accessToken) return
        const classId = selectedClass?.nid || data.class_id
        if (!classId) {
            toast.error('Please select a class first')
            return
        }
        try {
            setIsSubmitting(true)
            if (selectedModule) {
                await learningModuleService.updateLearningModule(selectedModule.nid, {
                    ModuleName: data.module_name, Description: data.description, ClassId: classId,
                    DepartmentId: data.department_id, SubjectId: data.subject_id,
                    AcademicYearId: data.academic_year_id, SchoolTermId: data.school_term_id,
                }, session.accessToken)
                toast.success('Learning module updated successfully')
            } else {
                const teacherId = parseInt(session?.user?.id || '0')
                await learningModuleService.createLearningModule({
                    ModuleName: data.module_name, Description: data.description, ClassId: classId,
                    DepartmentId: data.department_id, SubjectId: data.subject_id,
                    AcademicYearId: data.academic_year_id, SchoolTermId: data.school_term_id,
                    TeacherId: teacherId, NidTeacher: teacherId,
                }, session.accessToken)
                toast.success('Learning module created successfully')
            }
            setIsFormOpen(false)
            setEditingModule(null)
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
            await learningModuleService.enrollToLearningModule({ EnrollmentToken: token }, session.accessToken)
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

    const handleCopyToken = (token: string) => {
        navigator.clipboard.writeText(token)
        setCopiedToken(token)
        setTimeout(() => setCopiedToken(null), 2000)
    }

    const classModules = useMemo(() =>
        modules.filter(m => m.nid_class === selectedClass?.nid),
        [modules, selectedClass]
    )
    const totalPages = Math.ceil(totalRecords / itemsPerPage)

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

    const filteredClasses = useMemo(() => {
        const term = searchTerm.toLowerCase().trim()
        return classes.filter(cls => {
            if (term) {
                const name = cls.vname?.toLowerCase() || ''
                const description = cls.vdesc?.toLowerCase() || ''
                if (!name.includes(term) && !description.includes(term)) return false
            }
            return true
        })
    }, [classes, searchTerm])

    // Admin/other view: selected class with modules
    if (selectedClass) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={handleBackFromClass} className="p-2 hover:bg-white rounded-lg" title="Back">
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedClass.vname}</h2>
                                <p className="text-sm text-gray-500">
                                    {selectedClass.Department?.vdepartment_name || selectedClass.vdesc || `Dept ${selectedClass.nid_department}`} • {classModules.length} Modules
                                </p>
                            </div>
                        </div>
                        {canManage && (
                            <Button onClick={handleCreateModule} size="sm">
                                <Plus className="mr-1 h-4 w-4" /> Add Module
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
                        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-700">Module List</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {classModules.length === 0 ? (
                                    <div className="text-center py-8 px-4">
                                        <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No modules available</p>
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
                                                                <p className="text-xs text-gray-500">{subj?.vsubject_name || `Subject #${module.nid_subject}`}</p>
                                                                <p className="text-[10px] text-gray-400">{getAcademicYearLabel(module)} • {getSchoolTermLabel(module)}</p>
                                                            </div>
                                                        </div>
                                                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                                                            {module.nstatus === 1 ? 'Active' : 'Off'}
                                                        </span>
                                                    </div>
                                                    {canManage && (
                                                        <div className="flex gap-1 mt-2">
                                                            <button onClick={(e) => { e.stopPropagation(); handleEditModuleClick(module) }} className="p-1 text-blue-500 hover:bg-blue-100 rounded" title="Edit"><Edit className="h-3 w-3" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(module) }} className="p-1 text-red-500 hover:bg-red-100 rounded" title="Delete"><Trash2 className="h-3 w-3" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                            {selectedModule ? (<>
                                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{selectedModule.vname}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {(selectedModule.Subject || selectedModule.subject)?.vsubject_name || `Subject #${selectedModule.nid_subject}`} • {(selectedModule.Class || selectedModule.class)?.vname || `Class #${selectedModule.nid_class}`}
                                            </p>
                                        </div>
                                        {canManage && (
                                            <div className="flex gap-2">
                                                <Button onClick={handleCreateMaterial} size="sm" variant="outline" className="text-xs h-8"><FileText className="mr-1 h-3 w-3" /> + Material</Button>
                                                <Button onClick={handleCreateQuiz} size="sm" variant="outline" className="text-xs h-8 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"><ClipboardList className="mr-1 h-3 w-3" /> + Quiz</Button>
                                                <Button onClick={() => { setSelectedExam(null); setIsExamFormOpen(true) }} size="sm" variant="outline" className="text-xs h-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"><ClipboardCheck className="mr-1 h-3 w-3" /> + Exam</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-100 overflow-hidden">
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><FileText className="h-4 w-4 text-blue-500" /> Material</h4>
                                            <span className="text-xs text-gray-400">{materials.length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3">
                                            {materials.length === 0 ? (
                                                <div className="text-center py-8"><FileText className="h-8 w-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-gray-400">No materials</p></div>
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
                                                <div className="text-center py-8"><ClipboardList className="h-8 w-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-gray-400">No quizzes</p></div>
                                            ) : (<QuizList quizzes={quizzes} onEdit={handleEditQuiz} onDelete={handleDeleteQuiz} onViewQuestions={handleViewQuestions} isEditable={canManage} />)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4 text-red-500" /> Exam</h4>
                                            <span className="text-xs text-gray-400">{exams.length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3">
                                            {exams.length === 0 ? (
                                                <div className="text-center py-8"><ClipboardCheck className="h-8 w-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-gray-400">No exams</p></div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {exams.map(exam => (
                                                        <div key={exam.nid} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-medium text-sm text-gray-900">{exam.vtitle}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{exam.nduration} minutes</p>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded text-xs bg-green-100 text-green-700`}>
                                                                    {exam.nstatus === 1 ? 'Active' : 'Draft'}
                                                                </span>
                                                            </div>
                                                            {canManage && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <button onClick={() => setSelectedExam(exam)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                                                    <button onClick={() => handleDeleteExam(exam)} className="text-xs text-red-600 hover:underline">Delete</button>
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
                                        <p className="text-gray-400 text-lg font-medium">Select module</p>
                                        <p className="text-gray-300 text-sm mt-1">Click a module on the left to view details</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {canManage && (
                        <LearningModuleForm open={isFormOpen} onOpenChange={handleFormOpenChange} onSubmit={handleFormSubmit} initialData={selectedModule} isSubmitting={isSubmitting} departments={departments} classes={[selectedClass]} subjects={subjects} />
                    )}
                    {canManage && (
                        <MaterialForm open={isMaterialFormOpen} onOpenChange={setIsMaterialFormOpen} onSubmit={handleMaterialFormSubmit} initialData={selectedMaterial} isSubmitting={isSubmitting} learningModules={classModules} />
                    )}
                    {canManage && (
                        <QuizForm open={isQuizFormOpen} onOpenChange={setIsQuizFormOpen} onSubmit={handleQuizFormSubmit} initialData={selectedQuiz} isSubmitting={isSubmitting} learningModules={classModules} />
                    )}
                    {canManage && (
                        <ExamForm open={isExamFormOpen} onOpenChange={setIsExamFormOpen} onSubmit={handleExamFormSubmit} initialData={selectedExam} isSubmitting={isSubmitting} learningModules={classModules} selectedModuleId={selectedModule?.nid} />
                    )}
                    {canManage && selectedQuiz && (
                        <QuestionForm open={showQuestionForm} onOpenChange={setShowQuestionForm} onSubmit={handleQuestionFormSubmit} initialData={selectedQuestion} isSubmitting={isSubmitting} questionNumber={currentQuestionNumber} />
                    )}
                </div>
            </div>
        )
    }

    // Guru view: detail page
    if (isGuru && selectedModule) {
        return (
            <LearningModuleDetail
                module={selectedModule}
                materials={materials}
                quizzes={quizzes}
                exams={exams}
                assignments={assignments}
                canManage={canManage}
                onBack={handleBackFromModule}
                onCreateMaterial={handleCreateMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                onCreateQuiz={handleCreateQuiz}
                onDeleteQuiz={handleDeleteQuiz}
                onCreateExam={() => { setSelectedExam(null); setIsExamFormOpen(true) }}
                onDeleteExam={handleDeleteExam}
                onCreateAssignment={() => {}}
                onDeleteAssignment={() => {}}
            />
        )
    }

    // Guru view: list page
    if (isGuru && !selectedModule) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    <LearningModuleGrid
                        modules={modules}
                        loading={loading}
                        canManage={canManage}
                        onCreateModule={handleCreateModule}
                        onEditModule={handleEditModuleClick}
                        onDeleteModule={handleDeleteModule}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        copiedToken={copiedToken}
                        onCopyToken={handleCopyToken}
                    />
                    {canManage && (
                        <LearningModuleForm open={isFormOpen} onOpenChange={handleFormOpenChange} onSubmit={handleFormSubmit} initialData={editingModule} isSubmitting={isSubmitting} departments={departments} classes={classes} subjects={subjects} />
                    )}
                </div>
            </div>
        )
    }

    // Default: Admin/other - class list
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Materials" value={modules.length} icon={BookOpen} color="blue" />
                    <StatCard label="Assignments" value={0} icon={ClipboardList} color="green" />
                    <StatCard label="Quizzes" value={0} icon={FileText} color="purple" />
                    <StatCard label="Exams" value={0} icon={ClipboardCheck} color="red" />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-1">
                                <Search className="h-5 w-5 text-gray-500" />
                                <Input className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Search class..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
                                {searchTerm && (<button onClick={() => setSearchTerm('')} className="rounded-full p-1 hover:bg-gray-200"><X className="h-4 w-4 text-gray-500" /></button>)}
                            </div>
                            <p className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-900">{filteredClasses.length}</span> classes</p>
                        </div>
                    </div>

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
                                        <div key={cls.nid} onClick={() => handleClassClick(cls)} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                    <BookOpen className="h-3 w-3" />{moduleCount} Modules
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{cls.vname}</h3>
                                                    <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{cls.Department?.vdepartment_name || 'Dept ' + cls.nid_department}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">{cls.vdesc || 'No description available'}</p>
                                                <div className="pt-3 border-t border-gray-100">
                                                    <span className="text-xs text-blue-600 font-medium">Click to view modules →</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {!loading && totalRecords > itemsPerPage && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />)}

                <EnrollModuleDialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen} onEnroll={handleEnroll} isEnrolling={isEnrolling} />
            </div>
        </div>
    )
}

interface StatCardProps { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: 'blue' | 'green' | 'purple' | 'red' }

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    const colors = { blue: 'from-blue-500 to-blue-600', green: 'from-green-500 to-green-600', purple: 'from-purple-500 to-purple-600', red: 'from-red-500 to-red-600' }
    const bgColors = { blue: 'bg-blue-50', green: 'bg-green-50', purple: 'bg-purple-50', red: 'bg-red-50' }
    const textColors = { blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600', red: 'text-red-600' }

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors[color]}`} />
            <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-gray-600 mb-1">{label}</p><p className="text-3xl font-bold text-gray-900">{value}</p></div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bgColors[color]}`}><Icon className={`h-7 w-7 ${textColors[color]}`} /></div>
            </div>
        </div>
    )
}
