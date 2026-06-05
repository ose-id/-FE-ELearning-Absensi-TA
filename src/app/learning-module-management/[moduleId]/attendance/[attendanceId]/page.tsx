'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CalendarCheck, Check, X, Save, RotateCcw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import { attendanceService } from '@/services/attendance.service'
import { Attendance, AttendanceRecord } from '@/types/attendance'

// Status constants
const ATTENDANCE_STATUS = {
    HADIR: 1,
    IZIN: 2,
    SAKIT: 3,
    ALPHA: 4
}

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: 'Hadir', color: 'bg-green-100 text-green-700' },
    2: { label: 'Izin', color: 'bg-yellow-100 text-yellow-700' },
    3: { label: 'Sakit', color: 'bg-orange-100 text-orange-700' },
    4: { label: 'Alpha', color: 'bg-red-100 text-red-700' },
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

interface StudentAttendance {
    studentId: number
    studentName: string
    status: number
    notes: string
}

export default function AttendanceRecordPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)
    const attendanceId = parseInt(params.attendanceId as string)

    const [attendance, setAttendance] = useState<Attendance | null>(null)
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Student attendance state
    const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>([])
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (session?.accessToken) {
            fetchAttendance()
            fetchRecords()
        }
    }, [session?.accessToken, attendanceId])

    const fetchAttendance = async () => {
        if (!session?.accessToken) return
        try {
            const response = await attendanceService.getAttendanceById(attendanceId, session.accessToken)
            setAttendance(response)
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
        }
    }

    const fetchRecords = async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await attendanceService.getAttendanceRecords(attendanceId, session.accessToken)
            setRecords(response)

            // Initialize student attendances from existing records
            const initialAttendances: StudentAttendance[] = response.map((record: AttendanceRecord) => ({
                studentId: record.nid_student,
                studentName: record.Student?.vname || record.Student?.vfull_name || `Siswa ${record.nid_student}`,
                status: record.nstatus,
                notes: record.vnotes || ''
            }))
            setStudentAttendances(initialAttendances)
        } catch (error) {
            console.error('Failed to fetch records:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = (studentId: number, status: number) => {
        setStudentAttendances(prev =>
            prev.map(s =>
                s.studentId === studentId ? { ...s, status } : s
            )
        )
        setHasChanges(true)
    }

    const handleBulkMark = (status: number) => {
        setStudentAttendances(prev =>
            prev.map(s => ({ ...s, status }))
        )
        setHasChanges(true)
    }

    const handleReset = () => {
        // Reset to initial state from records
        const initialAttendances: StudentAttendance[] = records.map((record: AttendanceRecord) => ({
            studentId: record.nid_student,
            studentName: record.Student?.vname || record.Student?.vfull_name || `Siswa ${record.nid_student}`,
            status: record.nstatus,
            notes: record.vnotes || ''
        }))
        setStudentAttendances(initialAttendances)
        setHasChanges(false)
    }

    const handleSave = async () => {
        if (!session?.accessToken) return

        try {
            setSaving(true)

            // Prepare records for bulk update
            const recordsToSave = studentAttendances.map(s => ({
                StudentId: s.studentId,
                Status: s.status,
                Notes: s.notes || undefined
            }))

            await attendanceService.bulkRecordAttendance(attendanceId, { Records: recordsToSave }, session.accessToken)
            toast.success('Absensi berhasil disimpan')
            setHasChanges(false)
            fetchRecords()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menyimpan absensi'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/learning-module-management/${moduleId}/attendance`)}
                            className="p-2 hover:bg-white rounded-lg border border-gray-200"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Rekam Absensi
                            </h1>
                            <p className="text-sm text-gray-500">
                                {attendance?.vname} - Pertemuan ke-{attendance?.nmeeting}
                            </p>
                            <p className="text-sm text-gray-500">
                                {attendance?.vdate ? new Date(attendance.vdate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                        <Button onClick={handleSave} disabled={!hasChanges || saving}>
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600">Tandai Semua:</span>
                        <Button size="sm" variant="outline" onClick={() => handleBulkMark(ATTENDANCE_STATUS.HADIR)}>
                            Hadir
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkMark(ATTENDANCE_STATUS.IZIN)}>
                            Izin
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkMark(ATTENDANCE_STATUS.SAKIT)}>
                            Sakit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkMark(ATTENDANCE_STATUS.ALPHA)}>
                            Alpha
                        </Button>
                    </div>
                </div>

                {/* Student List */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {studentAttendances.length === 0 ? (
                        <div className="text-center py-12">
                            <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada murid yang enroll di modul ini</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {studentAttendances.map((student) => (
                                <div
                                    key={student.studentId}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{student.studentName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={student.status}
                                            onChange={(e) => handleStatusChange(student.studentId, parseInt(e.target.value))}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                                                STATUS_LABELS[student.status]?.color || 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <option value={ATTENDANCE_STATUS.HADIR}>Hadir</option>
                                            <option value={ATTENDANCE_STATUS.IZIN}>Izin</option>
                                            <option value={ATTENDANCE_STATUS.SAKIT}>Sakit</option>
                                            <option value={ATTENDANCE_STATUS.ALPHA}>Alpha</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {studentAttendances.filter(s => s.status === ATTENDANCE_STATUS.HADIR).length}
                            </p>
                            <p className="text-sm text-gray-500">Hadir</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-600">
                                {studentAttendances.filter(s => s.status === ATTENDANCE_STATUS.IZIN).length}
                            </p>
                            <p className="text-sm text-gray-500">Izin</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">
                                {studentAttendances.filter(s => s.status === ATTENDANCE_STATUS.SAKIT).length}
                            </p>
                            <p className="text-sm text-gray-500">Sakit</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">
                                {studentAttendances.filter(s => s.status === ATTENDANCE_STATUS.ALPHA).length}
                            </p>
                            <p className="text-sm text-gray-500">Alpha</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
