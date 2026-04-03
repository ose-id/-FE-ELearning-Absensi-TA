
import { ApiResponse } from './auth-api'

export interface LearningModule {
    nid: number
    vname: string
    vdesc?: string
    nid_class: number
    nid_department: number
    nid_teacher: number
    nid_subject: number
    venrollment_token?: string
    term?: string
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
    Class?: {
        nid: number
        vname: string
    }
    Department?: {
        nid: number
        vdepartment_name: string
    }
    Subject?: {
        nid: number
        vsubject_name: string
    }
    Teacher?: {
        nid: number
        vname?: string
        vfull_name?: string
    }
}

export interface CreateLearningModuleRequest {
    ModuleName: string
    Description?: string
    ClassId: number
    DepartmentId: number
    SubjectId: number
    Term?: string
}

export interface UpdateLearningModuleRequest {
    ModuleName: string
    Description?: string
    ClassId: number
    DepartmentId: number
    SubjectId: number
    Term?: string
    Status?: number
}

export interface EnrollLearningModuleRequest {
    EnrollmentToken: string
}

export interface LearningModuleListResponse extends ApiResponse<LearningModule> { }
export interface LearningModuleDetailResponse extends ApiResponse<LearningModule> { }
