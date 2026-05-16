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

export interface CreateExamRequest {
    LearningModuleId: number
    Title: string
    Description?: string
    Duration: number
    StartDate: string
    EndDate: string
    PassGrade: number
    ShowResults: number
    Fullscreen: number
    Cutoff: number
    Status: number
}

export interface UpdateExamRequest {
    Title?: string
    Description?: string
    Duration?: number
    StartDate?: string
    EndDate?: string
    PassGrade?: number
    ShowResults?: number
    Fullscreen?: number
    Cutoff?: number
    Status?: number
}

export interface ExamListResponse extends ApiResponse<Exam> { }
