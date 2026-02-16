
import { Class, CreateClassRequest, UpdateClassRequest, ClassListResponse, ClassDetailResponse } from '@/types/class'

const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:32771'

class ClassService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${CLASS_API_URL}/api/Class`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        console.log(`[ClassService] Fetching: ${url}`)
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        console.log(`[ClassService] Response status: ${res.status} ${res.statusText}`)

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error(`[ClassService] Error response:`, errorData)
            throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
        }
        return res.json()
    }

    async getClasses(token: string): Promise<ClassListResponse> {
        return this.fetchWithAuth(this.baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async getClassById(id: number, token: string): Promise<Class> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data[0]
    }

    async createClass(data: CreateClassRequest, token: string): Promise<void> {
        await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async updateClass(id: number, data: UpdateClassRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteClass(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const classService = new ClassService()
