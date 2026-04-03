
import { ApiResponse } from './auth-api'

export interface Subject {
    nid: number
    nid_department: number
    vsubject_name: string
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

export interface CreateSubjectRequest {
    DepartmentId: number
    SubjectName: string
}

export interface UpdateSubjectRequest {
    DepartmentId: number
    SubjectName: string
    Status?: number
}

export interface SubjectListResponse extends ApiResponse<Subject> { }
export interface SubjectDetailResponse extends ApiResponse<Subject> { }
