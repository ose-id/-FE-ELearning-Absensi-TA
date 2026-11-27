
import { ApiResponse } from './auth-api'

export interface Role {
    nid?: number
    id?: number
    vrole_name?: string
    role_name?: string
    vrole_code?: string
    role_code?: string
    created_at?: string
    updated_at?: string
}

export interface CreateRoleRequest {
    vrole_name: string
    vrole_code: string
}

export interface UpdateRoleRequest {
    nid: number
    vrole_name: string
    vrole_code: string
}

export interface RoleListResponse extends ApiResponse<Role> { }
export interface RoleDetailResponse extends ApiResponse<Role> { }
