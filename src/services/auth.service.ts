// Authentication Service
// Handles all API calls to the .NET AuthService backend

import type { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, LogoutRequest } from '@/types/auth-api'

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.AUTH_API_URL || 'https://localhost:7192'

class AuthService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${AUTH_API_URL}/api/Auth`
    }

    /**
     * Login user with email and password
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('[AuthService] Calling login API:', `${this.baseUrl}/login`)
            console.log('[AuthService] Credentials:', { email: credentials.email })

            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            console.log('[AuthService] Response status:', response.status)

            const data: LoginResponse = await response.json()
            console.log('[AuthService] Response data:', JSON.stringify(data, null, 2))

            if (!response.ok || data.status === 'Error') {
                const errorMsg = typeof data.message?.Error === 'string'
                    ? data.message.Error
                    : 'Login failed'
                throw new Error(errorMsg)
            }

            if (!data.data || data.data.length === 0) {
                throw new Error('No user data returned')
            }

            return data
        } catch (error: any) {
            console.error('[AuthService] Login error:', error)
            throw error
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(tokens: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tokens),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed')
            }

            return data
        } catch (error) {
            console.error('[AuthService] Refresh token error:', error)
            throw error
        }
    }

    /**
     * Logout user
     */
    async logout(logoutRequest: LogoutRequest): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${logoutRequest.token}`,
                },
                body: JSON.stringify(logoutRequest),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Logout failed')
            }
        } catch (error) {
            console.error('[AuthService] Logout error:', error)
            throw error
        }
    }

    /**
     * Get current user from token
     */
    async getCurrentUser(token: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get user')
            }

            return data
        } catch (error) {
            console.error('[AuthService] Get current user error:', error)
            throw error
        }
    }
}

export const authService = new AuthService()
export default authService
