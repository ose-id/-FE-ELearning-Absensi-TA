import { Exam, CreateExamRequest, UpdateExamRequest } from '@/types/exam'

const EXAM_API_URL = process.env.NEXT_PUBLIC_EXAM_API_URL || process.env.EXAM_API_URL || 'https://localhost:5007'

class ExamService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${EXAM_API_URL}/api/Exam`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        console.log(`[ExamService] Fetching: ${url}`)

        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            })

            console.log(`[ExamService] Response status: ${res.status} ${res.statusText}`)

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.error(`[ExamService] Error response:`, errorData)
                throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
            }
            return res.json()
        } catch (error: any) {
            console.error(`[ExamService] Network error:`, error)
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Exam service tidak tersedia. Pastikan service sedang running.')
            }
            throw error
        }
    }

    async getExams(
        token: string,
        params?: { learning_module_id?: number },
        pageNumber = 1,
        pageSize = 10
    ): Promise<{ data: Exam[], totalRecords: number }> {
        const urlParams = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (params?.learning_module_id) urlParams.append('learning_module_id', params.learning_module_id.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}?${urlParams}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getExamsByModule(learningModuleId: number, token: string): Promise<{ data: Exam[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/learning-module/${learningModuleId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getExamById(id: number, token: string): Promise<Exam | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async createExam(data: CreateExamRequest, token: string): Promise<Exam> {
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async updateExam(id: number, data: UpdateExamRequest, token: string): Promise<Exam> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteExam(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const examService = new ExamService()
