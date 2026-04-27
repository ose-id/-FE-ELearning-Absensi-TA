'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Calendar, Filter, X, Users, Clock, BookOpen } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { attendanceService } from '@/services/attendance.service'
import { learningModuleService } from '@/services/learning-module.service'
import { Attendance, ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from '@/types/attendance'
import { LearningModule } from '@/types/learning-module'
import AttendanceList from './AttendanceList'
import AttendanceForm, { AttendanceFormData } from './AttendanceForm'
import AttendanceRecordDialog from './AttendanceRecordDialog'
import AttendanceHistoryView from './AttendanceHistoryView'

export default function AttendanceManagementPage() {
    const { data: session } = useSession()
    const [attendances, setAttendances] = useState<Attendance[]>([])
    const [learningModules, setLearningModules] = useState<LearningModule[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [moduleFilter, setModuleFilter] = useState<string>('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalRecords, setTotalRecords] = useState(0)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Record dialog
    const [isRecordOpen, setIsRecordOpen] = useState(false)
    const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | null>(null)

    const userRole = session?.user?.vrole_code?.toUpperCase()
    const isGuruOrAdmin = userRole === 'GR' || userRole === 'GURU' || userRole === 'TEACHER' || userRole === 'ADMIN' || userRole === 'ADM'
    const isMurid = userRole === 'MR' || userRole === 'MURID' || userRole === 'STUDENT'

    const fetchAttendances = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const moduleId = moduleFilter && moduleFilter !== 'All' ? parseInt(moduleFilter) : undefined
            const response = await attendanceService.getAllAttendances(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined,
                moduleId
            )
            setAttendances(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            console.error('Failed to fetch attendances:', error)
            toast.error(error.message || 'Failed to load attendances')
        } finally {
            setLoading(false)
        }
    }

    const fetchLearningModules = async () => {
        if (!session?.accessToken) return
        try {
            const response = await learningModuleService.getAllLearningModules(session.accessToken, 1, 100)
            setLearningModules(response.data)
        } catch (error: any) {
            console.error('Failed to fetch learning modules:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchAttendances()
            fetchLearningModules()
        }
    }, [session, currentPage, searchTerm, moduleFilter])

    const handleCreate = () => {
        setSelectedAttendance(null)
        setIsFormOpen(true)
    }

    const handleEdit = (attendance: Attendance) => {
        setSelectedAttendance(attendance)
        setIsFormOpen(true)
    }

    const handleDelete = async (attendance: Attendance) => {
        if (!confirm(`Are you sure you want to delete attendance "${attendance.vname}"?`)) return

        if (!session?.accessToken) return

        try {
            await attendanceService.deleteAttendance(attendance.nid, session.accessToken)
            toast.success('Attendance deleted successfully')
            fetchAttendances()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete attendance')
        }
    }

    const handleFormSubmit = async (data: AttendanceFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedAttendance) {
                await attendanceService.updateAttendance(
                    selectedAttendance.nid,
                    {
                        AttendanceName: data.attendance_name,
                        MeetingNumber: data.meeting_number,
                        AttendanceDate: data.attendance_date,
                        Status: data.status,
                    },
                    session.accessToken
                )
                toast.success('Attendance updated successfully')
            } else {
                await attendanceService.createAttendance(
                    {
                        LearningModuleId: data.learning_module_id,
                        AttendanceName: data.attendance_name,
                        MeetingNumber: data.meeting_number,
                        AttendanceDate: data.attendance_date,
                    },
                    session.accessToken
                )
                toast.success('Attendance created successfully')
            }

            setIsFormOpen(false)
            fetchAttendances()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save attendance')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRecordAttendance = (attendanceId: number) => {
        setSelectedAttendanceId(attendanceId)
        setIsRecordOpen(true)
    }

    const filteredAttendances = attendances.filter((att) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return att.vname?.toLowerCase().includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    // If Murid, show history view - pass session for history view
    if (isMurid) {
        return (
            <AttendanceHistoryView session={session} />
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Attendance Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage class attendance sessions and records
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Attendance
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
                                <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                                <Calendar className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-1">
                                <Search className="h-5 w-5 text-gray-500" />
                                <Input
                                    className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    placeholder="Search attendances..."
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
                                <Filter className="h-4 w-4 text-gray-500" />
                                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All Modules">
                                            {moduleFilter === 'All' ? 'All Modules' : learningModules.find(m => m.nid.toString() === moduleFilter)?.vname}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Modules</SelectItem>
                                        {learningModules.map((mod) => (
                                            <SelectItem key={mod.nid} value={mod.nid.toString()}>
                                                {mod.vname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading attendances...</p>
                                </div>
                            </div>
                        ) : (
                            <AttendanceList
                                attendances={filteredAttendances}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onRecord={handleRecordAttendance}
                                learningModules={learningModules}
                            />
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

                <AttendanceForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    initialData={selectedAttendance}
                    isSubmitting={isSubmitting}
                    learningModules={learningModules}
                />

                <AttendanceRecordDialog
                    open={isRecordOpen}
                    onOpenChange={setIsRecordOpen}
                    attendanceId={selectedAttendanceId}
                />
            </div>
        </div>
    )
}
