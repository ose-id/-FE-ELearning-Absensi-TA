
import { ApiResponse } from './auth-api'

export interface Department {
    nid: number
    vdepartment_name: string
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
}

export interface CreateDepartmentRequest {
    DepartmentName: string
}

export interface UpdateDepartmentRequest {
    DepartmentName: string
    Status?: number
}

export interface DepartmentListResponse extends ApiResponse<Department> { }
export interface DepartmentDetailResponse extends ApiResponse<Department> { }
