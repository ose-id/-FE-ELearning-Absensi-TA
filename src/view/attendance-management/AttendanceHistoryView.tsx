'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar, Clock, BookOpen, Check, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import { attendanceService } from '@/services/attendance.service'
import { AttendanceRecord, ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from '@/types/attendance'
import { Session } from 'next-auth'

interface AttendanceHistoryViewProps {
    session: Session | null
}

export default function AttendanceHistoryView({ session }: AttendanceHistoryViewProps) {
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [filterModuleId, setFilterModuleId] = useState<number | undefined>()

    useEffect(() => {
        if (session?.accessToken) {
            fetchHistory()
        }
    }, [session, filterModuleId])

    const fetchHistory = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const history = await attendanceService.getMyAttendanceHistory(filterModuleId, session.accessToken)
            setRecords(history)
        } catch (error: any) {
            console.error('Failed to fetch attendance history:', error)
            toast.error(error.message || 'Failed to load attendance history')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    <div className="flex justify-center p-12">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading your attendance history...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        My Attendance History
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        View your attendance records across all classes
                    </p>
                </div>

                {records.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No attendance records found</p>
                        <p className="text-sm text-gray-500 mt-1">Your attendance history will appear here</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                            <p className="text-sm text-gray-600">{records.length} total records</p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {records.map((record) => (
                                <div key={record.nid} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            record.nstatus === 1 ? 'bg-green-100 text-green-600' :
                                            record.nstatus === 2 ? 'bg-yellow-100 text-yellow-600' :
                                            record.nstatus === 3 ? 'bg-orange-100 text-orange-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {record.nstatus === 1 ? <Check className="h-5 w-5" /> :
                                             record.nstatus === 4 ? <AlertCircle className="h-5 w-5" /> :
                                             <Clock className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {record.Attendance?.vname || `Attendance ${record.nid_attendance}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {record.Attendance?.LearningModule?.vname || 'Module'}
                                                {record.Attendance?.vdate ? ` - ${new Date(record.Attendance.vdate).toLocaleDateString()}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${ATTENDANCE_STATUS_COLORS[record.nstatus]}`}>
                                            {ATTENDANCE_STATUS_LABELS[record.nstatus]}
                                        </span>
                                        {record.vnotes && (
                                            <p className="text-xs text-gray-500 mt-1">{record.vnotes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
