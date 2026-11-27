// Authentication API Types (Based on .NET AuthService)

// Backend response wrapper - ACTUAL FORMAT from backend
export interface ApiResponse<T> {
    status: string  // "1" for success, "Error" for failure
    data: T[]       // Array of data objects
    message: {
        [key: string]: string | string[]
    }
    total: number
}

export interface LoginRequest {
    email: string
    password: string
}

export interface AuthResponseData {
    id?: number
    nid?: number
    token: string
    username: string
    email: string
    fullName?: string
    fullname?: string
    role_nid?: number
    role_id?: number
    vrole_name?: string
    role_name?: string
    vrole_code?: string
    role_code?: string
}

export type LoginResponse = ApiResponse<AuthResponseData>

export interface UserData {
    id: string
    username: string
    email: string
    fullName: string
    roleId: string
    roleName: string
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
    fullName: string
    roleId: string
}

export interface RefreshTokenRequest {
    token: string
    refreshToken: string
}

export type RefreshTokenResponse = ApiResponse<{
    token: string
    refresh_token: string
    expires_in: number
}>

export interface LogoutRequest {
    token: string
}

export interface ApiErrorResponse extends ApiResponse<never> {
    status: 'Error'
}


