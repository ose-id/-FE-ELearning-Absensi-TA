
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { assignmentService } from '@/services/assignment.service'
import { classService } from '@/services/class.service'
import { Assignment } from '@/types/assignment'
import { Class } from '@/types/class'
import AssignmentList from './AssignmentList'
import AssignmentForm, { AssignmentFormData } from './AssignmentForm'

export default function AssignmentManagementPage() {
    const { data: session } = useSession()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [classes, setClasses] = useState<Class[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)

            const [assignmentsRes, classesRes] = await Promise.all([
                assignmentService.getAssignments(session.accessToken).catch(err => {
                    console.error("Failed to fetch assignments", err)
                    return { data: [] }
                }),
                classService.getClasses(session.accessToken).catch(err => {
                    console.error("Failed to fetch classes", err)
                    return { data: [] }
                })
            ])

            if (assignmentsRes && assignmentsRes.data) {
                setAssignments(assignmentsRes.data)
            }

            if (classesRes && classesRes.data) {
                setClasses(classesRes.data)
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
        // TODO: Navigate to submissions page or open modal
        toast.info('Submission view coming soon!')
    }

    const handleFormSubmit = async (data: AssignmentFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedAssignment) {
                // Update
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
                // Create
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
        const term = searchTerm.toLowerCase().trim()
        if (!term) return true

        const title = assignment.title?.toLowerCase() || ''
        const description = assignment.description?.toLowerCase() || ''
        const className = assignment.class_name?.toLowerCase() || ''

        return title.includes(term) || description.includes(term) || className.includes(term)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
                    <p className="text-sm text-gray-500">
                        Create and manage assignments for your classes
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                </Button>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                    className="border-none text-black bg-transparent focus-visible:ring-0"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <AssignmentList
                    assignments={filteredAssignments}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewSubmissions={handleViewSubmissions}
                />
            )}

            <AssignmentForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                initialData={selectedAssignment}
                isSubmitting={isSubmitting}
                classes={classes}
            />
        </div>
    )
}
