import { ApiResponse } from './auth-api'

export interface TeacherSubject {
    nid: number
    nid_teacher: number
    nid_subject: number
    nstatus: number
    dcrea?: string
    dmodi?: string
    vcrea?: string
    vmodi?: string
    Teacher?: {
        nid: number
        vfullname?: string
    }
    Subject?: {
        nid: number
        vsubject_name?: string
    }
}

export interface CreateTeacherSubjectRequest {
    TeacherId: number
    SubjectId: number
}

export interface UpdateTeacherSubjectRequest {
    TeacherId: number
    SubjectId: number
    Status?: number
}

export interface TeacherSubjectListResponse extends ApiResponse<TeacherSubject> { }
