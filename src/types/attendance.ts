
import { ApiResponse } from './auth-api'

// Attendance Session
export interface Attendance {
    nid: number
    nid_learning_module: number
    vname: string
    nmeeting: number
    vdate: string
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
    LearningModule?: LearningModuleBasic
}

interface LearningModuleBasic {
    nid: number
    vname: string
}

// Attendance Record
export interface AttendanceRecord {
    nid: number
    nid_attendance: number
    nid_student: number
    nstatus: number
    vnotes?: string
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
    Attendance?: Attendance
    Student?: StudentBasic
}

interface StudentBasic {
    nid: number
    vname?: string
    vfull_name?: string
    vemail?: string
    vnis?: string
}

// DTOs
export interface CreateAttendanceRequest {
    LearningModuleId: number
    AttendanceName: string
    MeetingNumber: number
    AttendanceDate: string
}

export interface UpdateAttendanceRequest {
    AttendanceName: string
    MeetingNumber: number
    AttendanceDate: string
    Status?: number
}

export interface RecordAttendanceRequest {
    StudentId: number
    Status: number
    Notes?: string
}

export interface UpdateAttendanceRecordRequest {
    Status: number
    Notes?: string
}

export interface BulkRecordAttendanceRequest {
    Records: RecordAttendanceRequest[]
}

// Response types
export interface AttendanceListResponse extends ApiResponse<Attendance> { }
export interface AttendanceDetailResponse extends ApiResponse<Attendance> { }
export interface AttendanceRecordListResponse extends ApiResponse<AttendanceRecord> { }
export interface AttendanceRecordDetailResponse extends ApiResponse<AttendanceRecord> { }

// Status labels
export const ATTENDANCE_STATUS_LABELS: Record<number, string> = {
    1: 'Hadir',
    2: 'Izin',
    3: 'Sakit',
    4: 'Alfa'
}

export const ATTENDANCE_STATUS_COLORS: Record<number, string> = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-red-100 text-red-800'
}
