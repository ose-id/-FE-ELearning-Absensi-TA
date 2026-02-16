
import { ApiResponse } from './auth-api'

export interface User {
    id: number
    username: string
    email: string
    fullname: string
    role_id: number
    role_name: string
    role_code: string
    created_at?: string
    updated_at?: string
}

export interface CreateUserRequest {
    username: string
    email: string
    password?: string // Optional for updates, required for create usually
    fullname: string
    role_id: number
}

export interface UpdateUserRequest {
    id: number
    username: string
    email: string
    fullname: string
    role_id: number
    password?: string // Optional if updating password
}

export interface UserListResponse extends ApiResponse<User> { }
export interface UserDetailResponse extends ApiResponse<User> { }
