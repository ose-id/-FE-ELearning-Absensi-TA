
import { ApiResponse } from './auth-api'

export interface Class {
    id: number
    name: string
    description: string
    code: string
    teacher_id: number
    teacher_name?: string
    created_at?: string
    updated_at?: string
}

export interface CreateClassRequest {
    name: string
    description: string;
    teacher_id: number;
}

export interface UpdateClassRequest {
    id: number
    name: string
    description: string
    teacher_id: number
}

export interface ClassListResponse extends ApiResponse<Class> { }
export interface ClassDetailResponse extends ApiResponse<Class> { }
