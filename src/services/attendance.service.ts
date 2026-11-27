
import {
    Attendance,
    AttendanceRecord,
    CreateAttendanceRequest,
    UpdateAttendanceRequest,
    RecordAttendanceRequest,
    UpdateAttendanceRecordRequest,
    BulkRecordAttendanceRequest,
    AttendanceListResponse,
    AttendanceRecordListResponse
} from '@/types/attendance'

const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:5003'

class AttendanceService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${CLASS_API_URL}/api/Attendance`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
        }
        return res.json()
    }

    // ===== Attendance Session Management =====

    async createAttendance(data: CreateAttendanceRequest, token: string): Promise<void> {
        await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async getAttendanceById(id: number, token: string): Promise<Attendance> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data[0]
    }

    async getAllAttendances(
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string,
        learningModuleId?: number
    ): Promise<{ data: Attendance[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)
        if (learningModuleId) params.append('learningModuleId', learningModuleId.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async updateAttendance(id: number, data: UpdateAttendanceRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteAttendance(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    // ===== Attendance Records Management =====

    async recordAttendance(attendanceId: number, data: RecordAttendanceRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${attendanceId}/record`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async bulkRecordAttendance(attendanceId: number, data: BulkRecordAttendanceRequest, token: string): Promise<number> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${attendanceId}/record-bulk`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data?.length || 0
    }

    async getAttendanceRecords(attendanceId: number, token: string): Promise<AttendanceRecord[]> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${attendanceId}/records`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data || []
    }

    async getMyAttendanceRecord(attendanceId: number, token: string): Promise<AttendanceRecord | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${attendanceId}/my-record`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data?.[0] || null
        } catch {
            return null
        }
    }

    async getMyAttendanceHistory(learningModuleId?: number, token?: string): Promise<AttendanceRecord[]> {
        const params = new URLSearchParams()
        if (learningModuleId) params.append('learningModuleId', learningModuleId.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}/my-history?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data || []
    }

    async updateAttendanceRecord(recordId: number, data: UpdateAttendanceRecordRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/record/${recordId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteAttendanceRecord(recordId: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/record/${recordId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const attendanceService = new AttendanceService()
