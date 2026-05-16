
import { ApiResponse } from './auth-api'

export interface LearningModule {
    nid: number
    vname: string
    vdesc?: string
    nid_class: number
    nid_department: number
    nid_teacher: number
    nid_subject: number
    nid_academic_year?: number
    nid_school_term?: number
    academic_year_id?: number
    school_term_id?: number
    venrollment_token?: string
    term?: string
    academic_year?: string
    vacademic_year?: string
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
    // Nested objects — API returns lowercase (class, department, subject)
    // but some code uses PascalCase, so we support both
    Class?: { nid: number; vname: string }
    class?: { nid: number; vname: string }
    Department?: { nid: number; vdepartment_name: string }
    department?: { nid: number; vdepartment_name: string }
    Subject?: { nid: number; vsubject_name: string }
    subject?: { nid: number; vsubject_name: string }
    Teacher?: { nid: number; vname?: string; vfull_name?: string }
    teacher?: { nid: number; vname?: string; vfull_name?: string }
    AcademicYear?: { nid: number; vyear?: string; vacademic_year_name?: string }
    academicYear?: { nid: number; vyear?: string; vacademic_year_name?: string }
    SchoolTerm?: { nid: number; vname?: string; vterm_name?: string }
    schoolTerm?: { nid: number; vname?: string; vterm_name?: string }
}

export interface CreateLearningModuleRequest {
    ModuleName: string
    Description?: string
    ClassId: number
    DepartmentId: number
    SubjectId: number
    AcademicYearId: number
    SchoolTermId: number
    TeacherId?: number // Required when Admin creates, optional for Guru (uses current user)
    NidTeacher?: number // Legacy alias for TeacherId used by some backend versions
}

export interface UpdateLearningModuleRequest {
    ModuleName: string
    Description?: string
    ClassId: number
    DepartmentId: number
    SubjectId: number
    AcademicYearId: number
    SchoolTermId: number
    Status?: number
}

export interface EnrollLearningModuleRequest {
    EnrollmentToken: string
}

export type LearningModuleListResponse = ApiResponse<LearningModule>
export type LearningModuleDetailResponse = ApiResponse<LearningModule>
