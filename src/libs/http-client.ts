// HTTP Client with automatic token attachment
// Use this for all authenticated API requests

import { getSession } from 'next-auth/react'

interface FetchOptions extends RequestInit {
    requiresAuth?: boolean
}

class HttpClient {
    private baseUrl: string

    constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl
    }

    /**
     * Make an HTTP request with automatic token attachment
     */
    async request<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const { requiresAuth = true, headers = {}, ...restOptions } = options

        const config: RequestInit = {
            ...restOptions,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        }

        // Attach authorization token for authenticated requests
        if (requiresAuth) {
            const session = await getSession()

            if (session?.accessToken) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${session.accessToken}`,
                }
            }
        }

        const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint

        try {
            const response = await fetch(url, config)

            // Handle 401 Unauthorized - token expired
            if (response.status === 401 && requiresAuth) {
                // Token might be expired, trigger re-authentication
                console.error('[HttpClient] Unauthorized - token expired')
                // You can trigger a session refresh here or redirect to login
                throw new Error('Session expired. Please login again.')
            }

            // Parse JSON response
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`)
            }

            return data
        } catch (error) {
            console.error('[HttpClient] Request error:', error)
            throw error
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        })
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        body?: any,
        options?: FetchOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        })
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        body?: any,
        options?: FetchOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        })
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        body?: any,
        options?: FetchOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        })
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        })
    }
}

// Create instances for different API services
export const authHttpClient = new HttpClient(
    process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://localhost:7192'
)

export const assignmentHttpClient = new HttpClient(
    process.env.NEXT_PUBLIC_ASSIGNMENT_API_URL || 'https://localhost:5005'
)

export const classHttpClient = new HttpClient(
    process.env.NEXT_PUBLIC_CLASS_API_URL || 'https://localhost:5003'
)

export default HttpClient
