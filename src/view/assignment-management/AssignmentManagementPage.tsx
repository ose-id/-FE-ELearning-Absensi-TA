'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, FileText, BookOpen } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Card from '@/components/ui/card'
import CardContent from '@/components/ui/card/card-content'
import CardHeader from '@/components/ui/card/card-header'
import CardTitle from '@/components/ui/card/card-title'
import CardDescription from '@/components/ui/card/card-description'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { assignmentService } from '@/services/assignment.service'
import { classService } from '@/services/class.service'
import { learningModuleService } from '@/services/learning-module.service'
import { Assignment } from '@/types/assignment'
import { Class } from '@/types/class'
import { LearningModule } from '@/types/learning-module'
import AssignmentList from './AssignmentList'
import AssignmentForm, { AssignmentFormData } from './AssignmentForm'
import SubmissionsDialog from './SubmissionsDialog'

export default function AssignmentManagementPage() {
    const { data: session } = useSession()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [classes, setClasses] = useState<Class[]>([])
    const [learningModules, setLearningModules] = useState<LearningModule[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Submissions Dialog
    const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false)
    const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<Assignment | null>(null)

    const userRole = session?.user?.vrole_code?.toUpperCase()
    const isGuru = userRole === 'GR' || userRole === 'GURU' || userRole === 'TEACHER'
    const isAdmin = userRole === 'ADMIN' || userRole === 'ADM'
    const isMurid = userRole === 'MR' || userRole === 'MURID' || userRole === 'STUDENT'

    const fetchData = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)

            // Get assignments - if teacher, filter by teacherId
            let assignmentsRes
            if (isGuru) {
                assignmentsRes = await assignmentService.getAssignmentsByTeacher(session.accessToken).catch(() => ({ data: [] }))
            } else {
                assignmentsRes = await assignmentService.getAssignments(session.accessToken).catch(() => ({ data: [] }))
            }

            // Get classes for form dropdown
            const classesRes = await classService.getClasses(session.accessToken, 1, 100).catch(() => ({ data: [] }))

            // Get learning modules for form dropdown
            const modulesRes = await learningModuleService.getAllLearningModules(session.accessToken, 1, 100).catch(() => ({ data: [] }))

            if (assignmentsRes && assignmentsRes.data) {
                setAssignments(assignmentsRes.data)
            }

            if (classesRes && classesRes.data) {
                setClasses(classesRes.data)
            }

            if (modulesRes && modulesRes.data) {
                setLearningModules(modulesRes.data)
            }

        } catch (error: any) {
            console.error('Failed to fetch data:', error)
            toast.error(error.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [session])

    const handleCreate = () => {
        setSelectedAssignment(null)
        setIsFormOpen(true)
    }

    const handleEdit = (assignment: Assignment) => {
        setSelectedAssignment(assignment)
        setIsFormOpen(true)
    }

    const handleDelete = async (assignment: Assignment) => {
        if (!confirm(`Are you sure you want to delete "${assignment.title}"?`)) return

        if (!session?.accessToken) return

        try {
            await assignmentService.deleteAssignment(assignment.id, session.accessToken)
            toast.success('Assignment deleted successfully')
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete assignment')
        }
    }

    const handleViewSubmissions = (assignment: Assignment) => {
        setSelectedAssignmentForSubmissions(assignment)
        setIsSubmissionsOpen(true)
    }

    const handleFormSubmit = async (data: AssignmentFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedAssignment) {
                await assignmentService.updateAssignment(
                    selectedAssignment.id,
                    {
                        id: selectedAssignment.id,
                        ...data,
                    },
                    session.accessToken
                )
                toast.success('Assignment updated successfully')
            } else {
                await assignmentService.createAssignment(
                    data,
                    session.accessToken
                )
                toast.success('Assignment created successfully')
            }

            setIsFormOpen(false)
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save assignment')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredAssignments = assignments.filter((assignment) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase().trim()
        const title = assignment.title?.toLowerCase() || ''
        const description = assignment.description?.toLowerCase() || ''
        const className = assignment.class_name?.toLowerCase() || ''
        return title.includes(term) || description.includes(term) || className.includes(term)
    })

    // Stats based on role
    const stats = [
        { label: 'Total', value: filteredAssignments.length, icon: FileText, color: 'from-blue-500 to-blue-600' },
        { label: 'Upcoming', value: filteredAssignments.filter(a => new Date(a.due_date) > new Date()).length, icon: BookOpen, color: 'from-green-500 to-green-600' },
        { label: 'Overdue', value: filteredAssignments.filter(a => new Date(a.due_date) < new Date()).length, icon: FileText, color: 'from-red-500 to-red-600' },
    ]

    if (loading && assignments.length === 0) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading assignments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        {isMurid ? 'My Assignments' : 'Assignment Management'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isMurid ? 'View and submit your assignments' : isGuru ? 'Manage assignments for your classes' : 'Manage all assignments'}
                    </p>
                </div>
                {(isAdmin || isGuru) && (
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${stat.color}`}>
                                    <stat.icon className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Assignments</CardTitle>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 w-full sm:w-80">
                            <Search className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <Input
                                className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                                placeholder="Search assignments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredAssignments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">
                                {searchTerm ? 'No assignments found' : 'No assignments available'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {searchTerm ? 'Try a different search term' : (isGuru || isAdmin) ? 'Create your first assignment' : 'Check back later'}
                            </p>
                        </div>
                    ) : (
                        <AssignmentList
                            assignments={filteredAssignments}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewSubmissions={handleViewSubmissions}
                            isEditable={isAdmin || isGuru}
                            isTeacher={isGuru}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Assignment Form Dialog */}
            {(isAdmin || isGuru) && (
                <AssignmentForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    initialData={selectedAssignment}
                    isSubmitting={isSubmitting}
                    classes={classes}
                    learningModules={learningModules}
                />
            )}

            {/* Submissions Dialog - for teachers to view and grade submissions */}
            {(isAdmin || isGuru) && (
                <SubmissionsDialog
                    open={isSubmissionsOpen}
                    onOpenChange={setIsSubmissionsOpen}
                    assignment={selectedAssignmentForSubmissions}
                />
            )}
        </div>
    )
}
