import { Exam, CreateExamRequest, UpdateExamRequest, ExamQuestion, StudentExamAttempt, SubmitExamAttemptRequest } from '@/types/exam'

const EXAM_API_URL = process.env.NEXT_PUBLIC_EXAM_API_URL || process.env.EXAM_API_URL || 'https://localhost:5007'

class ExamService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${EXAM_API_URL}/api/Exam`
    }

    private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
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
            return res.json() as Promise<T>
        } catch (error: unknown) {
            console.error(`[ExamService] Network error:`, error)
            const err = error as Error
            if (err && err.name === 'TypeError' && err.message?.includes('fetch')) {
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

        const response = await this.fetchWithAuth<{ data?: Exam[], totalRecords?: number }>(`${this.baseUrl}?${urlParams}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getExamsByModule(learningModuleId: number, token: string): Promise<{ data: Exam[], totalRecords: number }> {
        const response = await this.fetchWithAuth<{ data?: Exam[], totalRecords?: number }>(`${this.baseUrl}/learning-module/${learningModuleId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getExamById(id: number, token: string): Promise<Exam | null> {
        try {
            const response = await this.fetchWithAuth<{ data?: Exam | Exam[] }>(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = Array.isArray(response.data) ? response.data[0] : response.data
            return data ?? null
        } catch {
            return null
        }
    }

    async createExam(data: CreateExamRequest, token: string): Promise<Exam> {
        const response = await this.fetchWithAuth<{ data: Exam[] }>(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async updateExam(id: number, data: UpdateExamRequest, token: string): Promise<Exam> {
        const response = await this.fetchWithAuth<{ data: Exam[] }>(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteExam(id: number, token: string): Promise<void> {
        await this.fetchWithAuth<unknown>(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    // Exam Questions CRUD
    async getExamQuestions(examId: number, token: string): Promise<{ data: ExamQuestion[], totalRecords: number }> {
        const response = await this.fetchWithAuth<{ data?: ExamQuestion[], totalRecords?: number }>(`${this.baseUrl}/${examId}/questions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async createExamQuestion(data: unknown, token: string): Promise<ExamQuestion> {
        const response = await this.fetchWithAuth<{ data: ExamQuestion[] }>(`${EXAM_API_URL}/api/ExamQuestion`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async updateExamQuestion(id: number, data: unknown, token: string): Promise<ExamQuestion> {
        const response = await this.fetchWithAuth<{ data: ExamQuestion[] }>(`${EXAM_API_URL}/api/ExamQuestion/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteExamQuestion(id: number, token: string): Promise<void> {
        await this.fetchWithAuth<unknown>(`${EXAM_API_URL}/api/ExamQuestion/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async submitExamAttempt(examId: number, data: SubmitExamAttemptRequest, token: string): Promise<unknown> {
        return await this.fetchWithAuth(`${this.baseUrl}/${examId}/attempt`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async getMyExamAttempt(examId: number, token: string): Promise<StudentExamAttempt | null> {
        const response = await this.fetchWithAuth<{ data: StudentExamAttempt | null }>(`${this.baseUrl}/${examId}/my-attempt`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    }

    async getExamAttempts(examId: number, token: string): Promise<StudentExamAttempt[]> {
        const response = await this.fetchWithAuth<{ data: StudentExamAttempt[] }>(`${this.baseUrl}/${examId}/attempts`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data || []
    }
}

export const examService = new ExamService()
