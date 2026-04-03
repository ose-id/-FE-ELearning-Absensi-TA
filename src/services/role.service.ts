
import { Role, CreateRoleRequest, UpdateRoleRequest, RoleListResponse } from '@/types/role'

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.AUTH_API_URL || 'https://localhost:7192'

class RoleService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${AUTH_API_URL}/api/Role`
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
            throw new Error(errorData.message?.message || errorData.title || 'API request failed')
        }
        return res.json()
    }

    // Helper to extract data from both {data: []} and direct [] responses
    private getData(res: any): any[] {
        if (Array.isArray(res)) return res
        if (res && Array.isArray(res.data)) return res.data
        return []
    }

    async getRoles(token: string): Promise<RoleListResponse> {
        const response = await this.fetchWithAuth(this.baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            status: '1',
            data: this.getData(response),
            total: this.getData(response).length,
            message: {}
        }
    }

    async getRoleById(nid: number, token: string): Promise<Role> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${nid}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const roles = this.getData(response)
        return roles[0]
    }

    async createRole(data: CreateRoleRequest, token: string): Promise<void> {
        await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async updateRole(nid: number, data: UpdateRoleRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${nid}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteRole(nid: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${nid}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const roleService = new RoleService()
