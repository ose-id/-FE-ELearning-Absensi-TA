
import {
    Assignment,
    CreateAssignmentRequest,
    UpdateAssignmentRequest,
    AssignmentListResponse,
    SubmissionListResponse,
    SubmitAssignmentRequest,
    GradeSubmissionRequest
} from '@/types/assignment'

const ASSIGNMENT_API_URL = process.env.NEXT_PUBLIC_ASSIGNMENT_API_URL || process.env.ASSIGNMENT_API_URL || 'https://localhost:32773'

class AssignmentService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${ASSIGNMENT_API_URL}/api/Assignment`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
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
            const errorData = await res.json().catch(() => ({}))
            console.error(`[AssignmentService] Error response:`, errorData)
            throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
        }
        return res.json()
    }

    async getAssignments(token: string): Promise<AssignmentListResponse> {
        return this.fetchWithAuth(this.baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async getAssignmentsByTeacher(token: string, teacherId?: number): Promise<AssignmentListResponse> {
        const params = new URLSearchParams()
        if (teacherId) params.append('teacherId', teacherId.toString())
        const queryString = params.toString() ? `?${params.toString()}` : ''
        return this.fetchWithAuth(`${this.baseUrl}${queryString}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async getAssignmentById(id: number, token: string): Promise<Assignment> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data[0]
    }

    async createAssignment(data: CreateAssignmentRequest, token: string): Promise<void> {
        await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async updateAssignment(id: number, data: UpdateAssignmentRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteAssignment(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async getSubmissions(assignmentId: number, token: string): Promise<SubmissionListResponse> {
        return this.fetchWithAuth(`${this.baseUrl}/${assignmentId}/submissions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async submitAssignment(data: SubmitAssignmentRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${data.assignment_id}/submit`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async gradeSubmission(submissionId: number, data: GradeSubmissionRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/submissions/${submissionId}/grade`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async getMyAssignments(token: string): Promise<AssignmentListResponse> {
        return this.fetchWithAuth(`${this.baseUrl}/my-assignments`, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const assignmentService = new AssignmentService()
