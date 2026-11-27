
import { ApiResponse } from '@/types/auth-api'
import {
    Assignment,
    CreateAssignmentRequest,
    UpdateAssignmentRequest,
    AssignmentListResponse,
    SubmissionListResponse,
    SubmitAssignmentRequest,
    GradeSubmissionRequest,
    Submission,
    RawAssignment,
    RawSubmission,
    AssignmentSubmission
} from '@/types/assignment'

const ASSIGNMENT_API_URL = process.env.NEXT_PUBLIC_ASSIGNMENT_API_URL || process.env.ASSIGNMENT_API_URL || 'https://localhost:32773'

class AssignmentService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${ASSIGNMENT_API_URL}/api/Assignment`
    }

    private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
        console.log(`[AssignmentService] Fetching: ${url}`)
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        console.log(`[AssignmentService] Response status: ${res.status} ${res.statusText}`)

        if (!res.ok) {
            const errorData = (await res.json().catch(() => ({}))) as {
                message?: { message?: string } | string
                title?: string
            }
            console.error(`[AssignmentService] Error response:`, errorData)
            const errorMessage = typeof errorData.message === 'object'
                ? errorData.message?.message
                : errorData.message
            throw new Error(errorMessage || errorData.title || `API request failed (${res.status})`)
        }
        return res.json() as Promise<T>
    }

    private mapAssignment(raw: RawAssignment): Assignment {
        return {
            id: raw.nid,
            title: raw.vtitle || '',
            description: raw.vdescription || '',
            class_id: raw.LearningModule?.nid_class || raw.class_id || 0,
            learning_module_id: raw.nid_learning_module,
            due_date: raw.dsubmission || '',
            max_score: 100,
        }
    }

    async getAssignments(token: string): Promise<AssignmentListResponse> {
        const response = await this.fetchWithAuth<ApiResponse<RawAssignment>>(this.baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const mappedData = response.data ? response.data.map((raw) => this.mapAssignment(raw)) : []
        return {
            ...response,
            data: mappedData
        }
    }

    async getAssignmentsByTeacher(token: string, teacherId?: number): Promise<AssignmentListResponse> {
        const params = new URLSearchParams()
        if (teacherId) params.append('teacherId', teacherId.toString())
        const queryString = params.toString() ? `?${params.toString()}` : ''
        const response = await this.fetchWithAuth<ApiResponse<RawAssignment>>(`${this.baseUrl}${queryString}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const mappedData = response.data ? response.data.map((raw) => this.mapAssignment(raw)) : []
        return {
            ...response,
            data: mappedData
        }
    }

    async getAssignmentById(id: number, token: string): Promise<Assignment> {
        const response = await this.fetchWithAuth<ApiResponse<RawAssignment>>(`${this.baseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const raw = Array.isArray(response.data) ? response.data[0] : response.data
        if (!raw) {
            throw new Error('Assignment not found')
        }
        return this.mapAssignment(raw)
    }

    async createAssignment(data: CreateAssignmentRequest, token: string): Promise<void> {
        await this.fetchWithAuth<unknown>(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async updateAssignment(id: number, data: UpdateAssignmentRequest, token: string): Promise<void> {
        await this.fetchWithAuth<unknown>(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteAssignment(id: number, token: string): Promise<void> {
        await this.fetchWithAuth<unknown>(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    private mapSubmission(raw: RawSubmission): Submission {
        return {
            id: raw.nid,
            assignment_id: raw.nid_assignment,
            student_id: raw.nid_student,
            student_name: raw.Student?.vfull_name || raw.Student?.vname || `Student ${raw.nid_student}`,
            file_url: raw.vfile_path ? (raw.vfile_path.startsWith('http') ? raw.vfile_path : `${ASSIGNMENT_API_URL}${raw.vfile_path}`) : undefined,
            submitted_at: raw.dsubmitted_at || '',
            score: raw.nscore,
            feedback: raw.vfeedback || '',
            status: (raw.vmodi && raw.vmodi !== raw.vcrea) ? 'graded' : 'pending',
        }
    }

    async getSubmissions(assignmentId: number, token: string): Promise<SubmissionListResponse> {
        const response = await this.fetchWithAuth<ApiResponse<RawSubmission>>(`${this.baseUrl}/${assignmentId}/submissions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const mappedData = response.data ? response.data.map((raw) => this.mapSubmission(raw)) : []
        return {
            ...response,
            data: mappedData
        }
    }

    async submitAssignment(data: SubmitAssignmentRequest, token: string): Promise<void> {
        const { assignment_id, ...dto } = data
        await this.fetchWithAuth<unknown>(`${this.baseUrl}/${assignment_id}/submit`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(dto),
        })
    }

    async gradeSubmission(assignmentId: number, studentId: number, data: GradeSubmissionRequest, token: string): Promise<void> {
        await this.fetchWithAuth<unknown>(`${this.baseUrl}/${assignmentId}/grade/${studentId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async getMyAssignments(token: string): Promise<AssignmentListResponse> {
        const response = await this.fetchWithAuth<ApiResponse<RawAssignment>>(`${this.baseUrl}/my-assignments`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const mappedData = response.data ? response.data.map((raw) => this.mapAssignment(raw)) : []
        return {
            ...response,
            data: mappedData
        }
    }

    async getMySubmission(assignmentId: number, token: string): Promise<AssignmentSubmission | null> {
        try {
            const response = await this.fetchWithAuth<ApiResponse<RawSubmission>>(`${this.baseUrl}/${assignmentId}/my-submission`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const raw = response.data
            const data = Array.isArray(raw) ? raw[0] : raw
            return (data || null) as AssignmentSubmission | null
        } catch {
            return null
        }
    }
}

export const assignmentService = new AssignmentService()

