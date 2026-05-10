'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, BookOpen, Filter, X, Key, GraduationCap, ArrowLeft, Users, FileText, ClipboardList, ClipboardCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { learningModuleService } from '@/services/learning-module.service'
import { materialService } from '@/services/material.service'
import { quizService } from '@/services/quiz.service'
import { departmentService } from '@/services/department.service'
import { classService } from '@/services/class.service'
import { subjectService } from '@/services/subject.service'
import { lovService } from '@/services/lov.service'
import { LearningModule } from '@/types/learning-module'
import { Material } from '@/types/material'
import { Quiz } from '@/types/quiz'
import { Department } from '@/types/department'
import { Class } from '@/types/class'
import { Subject } from '@/types/subject'
import LearningModuleList from './LearningModuleList'
import LearningModuleForm, { LearningModuleFormData } from './LearningModuleForm'
import MaterialList from './MaterialList'
import MaterialForm, { MaterialFormData } from './MaterialForm'
import QuizList from './QuizList'
import QuizForm, { QuizFormData } from './QuizForm'
import QuestionForm, { QuestionFormData } from './QuestionForm'
import EnrollModuleDialog from './EnrollModuleDialog'

export default function LearningModuleManagementPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<Class[]>([])
    const [modules, setModules] = useState<LearningModule[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
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
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)

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
        } catch (error: any) {
            console.error('Failed to fetch classes:', error)
            toast.error(error.message || 'Failed to load classes')
        } finally {
            setLoading(false)
        }
    }

    const fetchModules = async () => {
        if (!session?.accessToken) return

        try {
            const response = await learningModuleService.getAllLearningModules(
                session.accessToken,
                1,
                100,
                searchTerm || undefined
            )
            setModules(response.data)
        } catch (error: any) {
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
        } catch (error: any) {
            console.error('Failed to fetch materials:', error)
        }
    }

    const fetchQuizzes = async (learningModuleId: number) => {
        if (!session?.accessToken) return

        try {
            const response = await quizService.getQuizzesByModule(learningModuleId, session.accessToken)
            setQuizzes(response.data)
        } catch (error: any) {
            console.error('Failed to fetch quizzes:', error)
        }
    }

    const fetchDepartments = async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getDepartments(session.accessToken)
            setDepartments(response as any)
        } catch (error: any) {
            console.error('Failed to fetch departments:', error)
        }
    }

    const fetchSubjects = async () => {
        if (!session?.accessToken) return
        try {
            const response = await subjectService.getAllSubjects(session.accessToken, 1, 100)
            setSubjects(response.data)
        } catch (error: any) {
            console.error('Failed to fetch subjects:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchClasses()
            fetchDepartments()
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

    const handleEditModule = (module: LearningModule) => {
        setSelectedModule(module)
        setIsFormOpen(true)
        // Fetch materials and quizzes for this module
        fetchMaterials(module.nid)
        fetchQuizzes(module.nid)
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
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete module')
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
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus materi')
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
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Gagal menyimpan materi')
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
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus quiz')
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
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Gagal menyimpan quiz')
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
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Gagal menyimpan pertanyaan')
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
                console.log('Creating LearningModule with:', {
                    ModuleName: data.module_name,
                    Description: data.description,
                    ClassId: selectedClass.nid,
                    DepartmentId: data.department_id,
                    SubjectId: data.subject_id,
                    AcademicYearId: data.academic_year_id,
                    SchoolTermId: data.school_term_id,
                    TeacherId: teacherId,
                })
                await learningModuleService.createLearningModule(
                    {
                        ModuleName: data.module_name,
                        Description: data.description,
                        ClassId: selectedClass.nid,
                        DepartmentId: data.department_id,
                        SubjectId: data.subject_id,
                        AcademicYearId: data.academic_year_id,
                        SchoolTermId: data.school_term_id,
                        TeacherId: teacherId,
                    },
                    session.accessToken
                )
                toast.success('Learning module created successfully')
            }

            setIsFormOpen(false)
            fetchModules()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save module')
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
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to enroll')
            throw error
        } finally {
            setIsEnrolling(false)
        }
    }

    // Filter modules by selected class
    const classModules = modules.filter(m => m.nid_class === selectedClass?.nid)

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
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackFromClass}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Kembali ke Daftar Kelas</span>
                        </button>
                    </div>

                    {/* Class Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                            <h2 className="text-2xl font-bold text-white">{selectedClass.vname}</h2>
                            <p className="text-blue-100 mt-1">
                                {selectedClass.Department?.vdepartment_name || `Department ${selectedClass.nid_department}`}
                            </p>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600">{selectedClass.vdesc || 'Tidak ada deskripsi'}</p>
                            <div className="flex gap-4 mt-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {classModules.length} Modul
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards - Detail Kelas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Materi</p>
                                    <p className="text-3xl font-bold text-gray-900">{classModules.length}</p>
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

                    {/* Modules Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Materi Pembelajaran</h3>
                            {canManage && (
                                <Button onClick={handleCreateModule}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Materi
                                </Button>
                            )}
                        </div>

                        <div className="p-6">
                            {classModules.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Belum ada modul pembelajaran untuk kelas ini</p>
                                    {canManage && (
                                        <Button onClick={handleCreateModule} className="mt-4">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Buat Modul Pertama
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <LearningModuleList
                                    modules={classModules}
                                    onEdit={handleEditModule}
                                    onDelete={handleDeleteModule}
                                    classes={classes}
                                    subjects={subjects}
                                    isEditable={canManage}
                                />
                            )}
                        </div>
                    </div>

                    {/* Materials Section - File/Materi Pelajaran */}
                    {selectedModule && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">File Materi - {selectedModule.vname}</h3>
                                {canManage && (
                                    <Button onClick={handleCreateMaterial}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah File Materi
                                    </Button>
                                )}
                            </div>

                            <div className="p-6">
                                {materials.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Belum ada file materi untuk modul ini</p>
                                        {canManage && (
                                            <Button onClick={handleCreateMaterial} className="mt-4">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Upload File Pertama
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <MaterialList
                                        materials={materials}
                                        onEdit={handleEditMaterial}
                                        onDelete={handleDeleteMaterial}
                                        isEditable={canManage}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quiz Section */}
                    {selectedModule && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Quiz / Ujian - {selectedModule.vname}</h3>
                                {canManage && (
                                    <Button onClick={handleCreateQuiz} className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Quiz
                                    </Button>
                                )}
                            </div>

                            <div className="p-6">
                                {quizzes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Belum ada quiz untuk modul ini</p>
                                        {canManage && (
                                            <Button onClick={handleCreateQuiz} className="mt-4 bg-purple-600 hover:bg-purple-700">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Buat Quiz Pertama
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <QuizList
                                        quizzes={quizzes}
                                        onEdit={handleEditQuiz}
                                        onDelete={handleDeleteQuiz}
                                        onViewQuestions={handleViewQuestions}
                                        isEditable={canManage}
                                    />
                                )}
                            </div>
                        </div>
                    )}

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
                                                            const dept = departments.find((d: any) => d.nid === cls.nid_department);
                                                            return (dept as any)?.label || dept?.vdepartment_name || `Dept ${cls.nid_department}`;
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