
import { ApiResponse } from './auth-api'

export interface Class {
    nid: number
    nid_department: number
    vname: string
    vdesc?: string
    term?: string
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
    Department?: {
        nid: number
        vdepartment_name: string
    }
}

export interface CreateClassRequest {
    ClassName: string
    DepartmentId: number
    Description?: string
    Term?: string
}

export interface UpdateClassRequest {
    ClassName: string
    DepartmentId: number
    Description?: string
    Term?: string
    Status?: number
}

export interface EnrollClassRequest {
    // No body needed, uses token to get student ID
}

export interface ClassListResponse extends ApiResponse<Class> { }
export interface ClassDetailResponse extends ApiResponse<Class> { }
