import { Quiz, QuizQuestion, StudentQuizAttempt, CreateQuizRequest, UpdateQuizRequest, CreateQuestionRequest, UpdateQuestionRequest } from '@/types/quiz'

const QUIZ_API_URL = process.env.NEXT_PUBLIC_QUIZ_API_URL || process.env.QUIZ_API_URL || 'https://localhost:32773'

class QuizService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${QUIZ_API_URL}/api/Quiz`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        console.log(`[QuizService] Fetching: ${url}`)
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        console.log(`[QuizService] Response status: ${res.status} ${res.statusText}`)

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error(`[QuizService] Error response:`, errorData)
            throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
        }
        return res.json()
    }

    // Quiz CRUD
    async getQuizzes(
        token: string,
        params?: { learning_module_id?: number; class_id?: number },
        pageNumber = 1,
        pageSize = 10
    ): Promise<{ data: Quiz[], totalRecords: number }> {
        const urlParams = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (params?.learning_module_id) urlParams.append('learning_module_id', params.learning_module_id.toString())
        if (params?.class_id) urlParams.append('class_id', params.class_id.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}?${urlParams}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getQuizById(id: number, token: string): Promise<Quiz | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async getQuizzesByModule(learningModuleId: number, token: string): Promise<{ data: Quiz[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/learning-module/${learningModuleId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async createQuiz(data: CreateQuizRequest, token: string): Promise<Quiz> {
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async updateQuiz(id: number, data: UpdateQuizRequest, token: string): Promise<Quiz> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteQuiz(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    // Questions CRUD
    async getQuestions(quizId: number, token: string): Promise<{ data: QuizQuestion[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${quizId}/questions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async createQuestion(data: CreateQuestionRequest, token: string): Promise<QuizQuestion> {
        const response = await this.fetchWithAuth(`${QUIZ_API_URL}/api/QuizQuestion`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async updateQuestion(id: number, data: UpdateQuestionRequest, token: string): Promise<QuizQuestion> {
        const response = await this.fetchWithAuth(`${QUIZ_API_URL}/api/QuizQuestion/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteQuestion(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${QUIZ_API_URL}/api/QuizQuestion/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    // Student Attempts
    async getAttempts(quizId: number, token: string): Promise<{ data: StudentQuizAttempt[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${quizId}/attempts`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getStudentAttempts(studentId: number, token: string): Promise<{ data: StudentQuizAttempt[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${QUIZ_API_URL}/api/StudentQuizAttempt/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async submitQuiz(quizId: number, answers: any[], token: string): Promise<any> {
        const response = await this.fetchWithAuth(`${QUIZ_API_URL}/api/QuizAttempt/submit`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ QuizId: quizId, Answers: answers }),
        })
        return response.data
    }

    async startQuizAttempt(quizId: number, token: string): Promise<any> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${quizId}/start`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    }
}

export const quizService = new QuizService()
