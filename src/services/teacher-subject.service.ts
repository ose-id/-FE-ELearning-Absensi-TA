import { TeacherSubject, CreateTeacherSubjectRequest, UpdateTeacherSubjectRequest, TeacherSubjectListResponse } from '@/types/teacher-subject'

const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:5003'

class TeacherSubjectService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${CLASS_API_URL}/api/TeacherSubject`
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

    async getAll(
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string
    ): Promise<{ data: TeacherSubject[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)

        const response = await this.fetchWithAuth(`${this.baseUrl}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getById(id: number, token: string): Promise<TeacherSubject | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async create(data: CreateTeacherSubjectRequest, token: string): Promise<TeacherSubject> {
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async update(id: number, data: UpdateTeacherSubjectRequest, token: string): Promise<TeacherSubject> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async delete(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const teacherSubjectService = new TeacherSubjectService()
