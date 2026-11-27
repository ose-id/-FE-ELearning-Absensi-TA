
import { Material, CreateMaterialRequest, UpdateMaterialRequest } from '@/types/material'

const ASSIGNMENT_API_URL = process.env.NEXT_PUBLIC_ASSIGNMENT_API_URL || process.env.ASSIGNMENT_API_URL || 'https://localhost:32773'

class MaterialService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${ASSIGNMENT_API_URL}/api/Material`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        console.log(`[MaterialService] Fetching: ${url}`)
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        console.log(`[MaterialService] Response status: ${res.status} ${res.statusText}`)

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error(`[MaterialService] Error response:`, errorData)
            throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
        }
        return res.json()
    }

    async createMaterial(data: CreateMaterialRequest, token: string): Promise<Material> {
        console.log('[MaterialService] Creating material:', data)
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async getMaterialById(id: number, token: string): Promise<Material | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async getMaterialsByLearningModule(
        learningModuleId: number,
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string
    ): Promise<{ data: Material[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)

        const response = await this.fetchWithAuth(`${this.baseUrl}/learning-module/${learningModuleId}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getAllMaterials(
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string
    ): Promise<{ data: Material[], totalRecords: number }> {
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

    async updateMaterial(id: number, data: UpdateMaterialRequest, token: string): Promise<Material> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteMaterial(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const materialService = new MaterialService()
