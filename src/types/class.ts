
import { ApiResponse } from './auth-api'

export interface Class {
    nid: number
    nid_department: number
    vname: string
    vdesc?: string
    academic_year_id?: number
    school_term_id?: number
    academic_year?: string
    school_term?: string
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
    AcademicYearId: number
    SchoolTermId: number
}

export interface UpdateClassRequest {
    ClassName: string
    DepartmentId: number
    Description?: string
    AcademicYearId: number
    SchoolTermId: number
    Status?: number
}

export interface EnrollClassRequest {
    // No body needed, uses token to get student ID
}

export interface ClassListResponse extends ApiResponse<Class> { }
export interface ClassDetailResponse extends ApiResponse<Class> { }
