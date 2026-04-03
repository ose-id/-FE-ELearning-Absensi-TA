
import {
    LearningModule,
    CreateLearningModuleRequest,
    UpdateLearningModuleRequest,
    EnrollLearningModuleRequest
} from '@/types/learning-module'

const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:32771'

class LearningModuleService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${CLASS_API_URL}/api/LearningModule`
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

    async createLearningModule(data: CreateLearningModuleRequest, token: string): Promise<LearningModule> {
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async getLearningModuleById(id: number, token: string): Promise<LearningModule | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async getAllLearningModules(
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string,
        teacherId?: number
    ): Promise<{ data: LearningModule[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)
        if (teacherId) params.append('teacherId', teacherId.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async enrollToLearningModule(data: EnrollLearningModuleRequest, token: string): Promise<string> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/enroll`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data
    }

    async getEnrolledLearningModules(
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string
    ): Promise<{ data: LearningModule[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)

        const response = await this.fetchWithAuth(`${this.baseUrl}/enrolled?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async updateLearningModule(id: number, data: UpdateLearningModuleRequest, token: string): Promise<LearningModule> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteLearningModule(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const learningModuleService = new LearningModuleService()
