
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '@/types/user'

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.AUTH_API_URL || 'https://localhost:7192'

class UserService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${AUTH_API_URL}/api/User`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        // Note: In a real app, you'd get the token from session/context here
        // For client-side requests, we can rely on next-auth's useSession hook to get the token 
        // and pass it, OR use a middleware/interceptor.
        // For simplicity in this `service` file which might be used server-side or client-side,
        // we'll assume the token is passed in headers or we rely on the component to manage it.
        // However, usually we can't easily access session here without passing it.
        // Let's assume the caller will pass the Authorization header in options, 
        // or we implement a helper that gets the session.

        // For now, I'll assume the component handles getting the token and passing it 
        // via a wrapper, OR we just implment the raw fetch here.

        console.log('[UserService] Request:', { url, method: options.method || 'GET', body: options.body })

        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        console.log('[UserService] Response:', { status: res.status, statusText: res.statusText })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error('[UserService] Error response:', errorData)

            // Better error message extraction
            const errorMessage =
                errorData.message?.message ||
                errorData.message?.Message ||
                errorData.message ||
                errorData.title ||
                errorData.errors?.[Object.keys(errorData.errors)[0]]?.[0] ||
                `API request failed (${res.status})`

            throw new Error(errorMessage)
        }
        return res.json()
    }

    async getUsers(token: string): Promise<UserListResponse> {
        return this.fetchWithAuth(this.baseUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    async getUserById(id: number, token: string): Promise<User> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data[0]
    }

    async createUser(data: CreateUserRequest, token: string): Promise<void> {
        await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async updateUser(id: number, data: UpdateUserRequest, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
    }

    async deleteUser(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const userService = new UserService()
