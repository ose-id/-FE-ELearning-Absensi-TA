import { QuestionBank, CreateQuestionBankRequest, UpdateQuestionBankRequest } from '@/types/question-bank'

const EXAM_API_URL = process.env.NEXT_PUBLIC_EXAM_API_URL || process.env.EXAM_API_URL || 'https://localhost:5007'

class QuestionBankService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${EXAM_API_URL}/api/Exam`
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

    async getQuestionBanks(
        token: string,
        pageNumber = 1,
        pageSize = 50,
        search?: string,
        teacherId?: number
    ): Promise<{ data: QuestionBank[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)
        if (teacherId) params.append('teacherId', teacherId.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}/question-bank?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getQuestionBankById(id: number, token: string): Promise<QuestionBank | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/question-bank/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async createQuestionBank(data: CreateQuestionBankRequest, token: string): Promise<QuestionBank> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/question-bank`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async updateQuestionBank(id: number, data: UpdateQuestionBankRequest, token: string): Promise<QuestionBank> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/question-bank/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteQuestionBank(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/question-bank/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const questionBankService = new QuestionBankService()
