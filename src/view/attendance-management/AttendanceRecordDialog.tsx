'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, ClipboardCheck, Check, X, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea/Textarea'

import Dialog from '@/components/ui/dialog'
import DialogContent from '@/components/ui/dialog/dialog-content'
import DialogDescription from '@/components/ui/dialog/dialog-description'
import DialogFooter from '@/components/ui/dialog/dialog-footer'
import DialogHeader from '@/components/ui/dialog/dialog-header'
import DialogTitle from '@/components/ui/dialog/dialog-title'

import Form from '@/components/ui/form'
import FormControl from '@/components/ui/form/form-control'
import FormLabel from '@/components/ui/form/form-label'
import FormMessage from '@/components/ui/form/form-message'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select/Select'

import { attendanceService } from '@/services/attendance.service'
import { userService } from '@/services/user.service'
import { AttendanceRecord, ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS, RecordAttendanceRequest } from '@/types/attendance'
import { User } from '@/types/user'

const recordSchema = z.object({
    student_id: z.number({ message: 'Student is required' }),
    status: z.number({ message: 'Status is required' }),
    notes: z.string().optional(),
})

// Transform snake_case to camelCase for API
const transformToApiRecord = (data: RecordFormData): RecordAttendanceRequest => ({
    StudentId: data.student_id,
    Status: data.status,
    Notes: data.notes,
})

type RecordFormData = z.infer<typeof recordSchema>

interface AttendanceRecordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    attendanceId: number | null
}

export default function AttendanceRecordDialog({ open, onOpenChange, attendanceId }: AttendanceRecordDialogProps) {
    const { data: session } = useSession()
    const [students, setStudents] = useState<User[]>([])
    const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isBulkMode, setIsBulkMode] = useState(false)
    const [bulkRecords, setBulkRecords] = useState<RecordFormData[]>([])

    const form = useForm<RecordFormData>({
        resolver: zodResolver(recordSchema),
        defaultValues: {
            student_id: 0,
            status: 1,
            notes: '',
        },
    })

    useEffect(() => {
        if (open && attendanceId && session?.accessToken) {
            fetchStudents()
            fetchExistingRecords()
        }
    }, [open, attendanceId, session])

    const fetchStudents = async () => {
        if (!session?.accessToken) return
        try {
            const response = await userService.getUsers(session.accessToken)
            // Filter only students
            const studentList = (response.data || []).filter((u: User) =>
                ['MR', 'MURID', 'STUDENT'].includes((u.vrole_code || '').toUpperCase())
            )
            setStudents(studentList)
        } catch (error: any) {
            console.error('Failed to fetch students:', error)
        }
    }

    const fetchExistingRecords = async () => {
        if (!session?.accessToken || !attendanceId) return
        try {
            const records = await attendanceService.getAttendanceRecords(attendanceId, session.accessToken)
            setExistingRecords(records)
        } catch (error: any) {
            console.error('Failed to fetch records:', error)
        }
    }

    const handleSubmit = async (data: RecordFormData) => {
        if (!session?.accessToken || !attendanceId) return

        try {
            setIsSubmitting(true)
            await attendanceService.recordAttendance(attendanceId, transformToApiRecord(data), session.accessToken)
            toast.success('Attendance recorded successfully')
            form.reset()
            fetchExistingRecords()
            onOpenChange(false)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to record attendance')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBulkSubmit = async () => {
        if (!session?.accessToken || !attendanceId || bulkRecords.length === 0) return

        try {
            setIsSubmitting(true)
            const result = await attendanceService.bulkRecordAttendance(
                attendanceId,
                { Records: bulkRecords.map(transformToApiRecord) },
                session.accessToken
            )
            toast.success(`${result} attendance records created successfully`)
            setBulkRecords([])
            setIsBulkMode(false)
            fetchExistingRecords()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to record bulk attendance')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const FormItem = ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Attendance</DialogTitle>
                    <DialogDescription>
                        Record attendance for a student in this session.
                    </DialogDescription>
                </DialogHeader>

                {/* Existing Records */}
                {existingRecords.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Records:</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {existingRecords.map((record) => (
                                <div key={record.nid} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">
                                        {record.Student?.vfull_name || record.Student?.vname || `Student ${record.nid_student}`}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ATTENDANCE_STATUS_COLORS[record.nstatus]}`}>
                                        {ATTENDANCE_STATUS_LABELS[record.nstatus]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student</FormLabel>
                                    <Select
                                        onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Student" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    {student.fullname} ({student.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{form.formState.errors.student_id?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                        value={field.value?.toString() || '1'}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">Hadir (Present)</SelectItem>
                                            <SelectItem value="2">Izin (Excused)</SelectItem>
                                            <SelectItem value="3">Sakit (Sick)</SelectItem>
                                            <SelectItem value="4">Alfa (Absent)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{form.formState.errors.status?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes..."
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.notes?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
