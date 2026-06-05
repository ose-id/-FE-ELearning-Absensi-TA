
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

    private mapAssignment(raw: any): Assignment {
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
        const response = await this.fetchWithAuth(this.baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (response && response.data) {
            response.data = response.data.map((raw: any) => this.mapAssignment(raw))
        }
        return response
    }

    async getAssignmentsByTeacher(token: string, teacherId?: number): Promise<AssignmentListResponse> {
        const params = new URLSearchParams()
        if (teacherId) params.append('teacherId', teacherId.toString())
        const queryString = params.toString() ? `?${params.toString()}` : ''
        const response = await this.fetchWithAuth(`${this.baseUrl}${queryString}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (response && response.data) {
            response.data = response.data.map((raw: any) => this.mapAssignment(raw))
        }
        return response
    }

    async getAssignmentById(id: number, token: string): Promise<Assignment> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const raw = response.data[0]
        return this.mapAssignment(raw)
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
        const response = await this.fetchWithAuth(`${this.baseUrl}/my-assignments`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (response && response.data) {
            response.data = response.data.map((raw: any) => this.mapAssignment(raw))
        }
        return response
    }

    async getMySubmission(assignmentId: number, token: string): Promise<any> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${assignmentId}/my-submission`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data || null
        } catch (error) {
            return null
        }
    }
}

export const assignmentService = new AssignmentService()

