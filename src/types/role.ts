
import { ApiResponse } from './auth-api'

export interface Role {
    id: number
    role_name: string
    role_code: string
    created_at?: string
    updated_at?: string
}

export interface CreateRoleRequest {
    role_name: string
    role_code: string
}

export interface UpdateRoleRequest {
    id: number
    role_name: string
    role_code: string
}

export interface RoleListResponse extends ApiResponse<Role> { }
export interface RoleDetailResponse extends ApiResponse<Role> { }
