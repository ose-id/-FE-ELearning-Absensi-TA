import { ApiResponse } from './auth-api'

export interface Exam {
    nid: number
    nid_learning_module: number
    vtitle?: string
    vdescription?: string
    nduration: number
    dstart: string
    dend: string
    npass_grade: number
    nshow_results: number
    nfullscreen: number
    ncutoff: number
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
    LearningModule?: {
        nid: number
        vname: string
    }
}

export interface ExamQuestion {
    nid: number
    nid_exam: number
    norder: number
    vquestion: string
    vtype: 'multiple_choice' | 'true_false' | 'essay'
    npoints: number
    vanswer_key?: string
    voptions?: string
    dcrea?: string
    dmodi?: string
}

export interface CreateExamRequest {
    nid_learning_module: number
    vtitle: string
    vdescription?: string
    nduration: number
    dstart: string
    dend: string
    npass_grade: number
    nshow_results: number
    nfullscreen: number
    ncutoff: number
    nstatus: number
}

export interface UpdateExamRequest {
    nid_learning_module: number
    vtitle: string
    vdescription?: string
    nduration: number
    dstart: string
    dend: string
    npass_grade: number
    nshow_results: number
    nfullscreen: number
    ncutoff: number
    nstatus: number
}

export interface ExamListResponse extends ApiResponse<Exam> { }
