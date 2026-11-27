'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search, Loader2, CalendarCheck, Edit, Trash2, X, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { learningModuleService } from '@/services/learning-module.service'
import { attendanceService } from '@/services/attendance.service'
import { LearningModule } from '@/types/learning-module'
import { Attendance } from '@/types/attendance'

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

export default function ModuleAttendancePage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)

    const [module, setModule] = useState<LearningModule | null>(null)
    const [attendances, setAttendances] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [attendanceName, setAttendanceName] = useState('')
    const [meetingNumber, setMeetingNumber] = useState(1)
    const [attendanceDate, setAttendanceDate] = useState('')

    useEffect(() => {
        if (session?.accessToken) {
            fetchModule()
            fetchAttendances()
        }
    }, [session?.accessToken, moduleId])

    const fetchModule = async () => {
        if (!session?.accessToken) return
        try {
            const teacherId = parseInt(session.user?.id || '0')
            const response = await learningModuleService.getAllLearningModules(
                session.accessToken,
                1,
                100,
                undefined,
                teacherId
            )
            const foundModule = response.data.find(m => m.nid === moduleId)
            setModule(foundModule || null)
        } catch (error) {
            console.error('Failed to fetch module:', error)
        }
    }

    const fetchAttendances = async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await attendanceService.getAllAttendances(
                session.accessToken,
                1,
                50,
                undefined,
                moduleId
            )
            setAttendances(response.data)
        } catch (error) {
            console.error('Failed to fetch attendances:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setAttendanceName('')
        setMeetingNumber(attendances.length + 1)
        setAttendanceDate(new Date().toISOString().split('T')[0])
        setIsFormOpen(true)
    }

    const handleDelete = async (attendance: Attendance) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus sesi absensi "${attendance.vname}"?`)) return
        if (!session?.accessToken) return

        try {
            await attendanceService.deleteAttendance(attendance.nid, session.accessToken)
            toast.success('Absensi berhasil dihapus')
            fetchAttendances()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menghapus absensi'))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)
            await attendanceService.createAttendance(
                {
                    LearningModuleId: moduleId,
                    AttendanceName: attendanceName,
                    MeetingNumber: meetingNumber,
                    AttendanceDate: attendanceDate,
                },
                session.accessToken
            )
            toast.success('Absensi berhasil dibuat')
            setIsFormOpen(false)
            fetchAttendances()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal membuat absensi'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredAttendances = attendances.filter(a =>
        a.vname?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/learning-module-management/${moduleId}`)}
                            className="p-2 hover:bg-white rounded-lg border border-gray-200"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Absensi - {module?.vname || 'Loading...'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Kelola absensi untuk pertemuan
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Pertemuan
                    </Button>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <Input
                            className="flex-1 border-none bg-transparent focus-visible:ring-0"
                            placeholder="Cari absensi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')}>
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredAttendances.length === 0 ? (
                        <div className="text-center py-12">
                            <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada sesi absensi</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Pertemuan
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredAttendances.map((attendance) => (
                                <div
                                    key={attendance.nid}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <CalendarCheck className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{attendance.vname}</p>
                                            <p className="text-sm text-gray-500">
                                                Pertemuan ke-{attendance.nmeeting} | {attendance.vdate ? new Date(attendance.vdate).toLocaleDateString('id-ID') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            attendance.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {attendance.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <button
                                            onClick={() => router.push(`/learning-module-management/${moduleId}/attendance/${attendance.nid}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="Rekam Absensi"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(attendance)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    Tambah Pertemuan
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Pertemuan
                                    </label>
                                    <Input
                                        value={attendanceName}
                                        onChange={(e) => setAttendanceName(e.target.value)}
                                        placeholder="Contoh: Pertemuan 1 - Pembelajaran Intro"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nomor Pertemuan
                                    </label>
                                    <Input
                                        type="number"
                                        value={meetingNumber}
                                        onChange={(e) => setMeetingNumber(parseInt(e.target.value))}
                                        min={1}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal
                                    </label>
                                    <Input
                                        type="date"
                                        value={attendanceDate}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Menyimpan...' : 'Tambah'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
