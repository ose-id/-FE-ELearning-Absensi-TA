
import { ApiResponse } from './auth-api'

export interface User {
    id: number
    username: string
    email: string
    fullname: string
    role_id: number
    role_name: string
    role_code: string
    birthdate?: string
    address?: string
    phone?: string
    whatsapp?: string
    nik?: string
    class_name?: string
    status?: string
    created_at?: string
    updated_at?: string
}

export interface CreateUserRequest {
    username: string
    email: string
    password?: string // Optional for updates, required for create usually
    fullname: string
    birthdate?: string
    address?: string
    phone?: string
    whatsapp?: string
    nik?: string
    class_name?: string
    role_id: number
    status?: string
}

export interface UpdateUserRequest {
    id: number
    username: string
    email: string
    fullname: string
    role_id: number
    password?: string // Optional if updating password
    birthdate?: string
    address?: string
    phone?: string
    whatsapp?: string
    nik?: string
    class_name?: string
    status?: string
}

export interface UserListResponse extends ApiResponse<User> { }
export interface UserDetailResponse extends ApiResponse<User> { }
