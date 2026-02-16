
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

    async getRoles(token: string): Promise<RoleListResponse> {
        return this.fetchWithAuth(this.baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async getRoleById(id: number, token: string): Promise<Role> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data[0]
    }

    async createRole(data: CreateRoleRequest, token: string): Promise<void> {
        await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async updateRole(id: number, data: UpdateRoleRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteRole(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const roleService = new RoleService()
