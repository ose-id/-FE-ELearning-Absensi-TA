import { ApiResponse } from './auth-api'

export interface QuestionBank {
    nid: number
    vquestion: string
    vtype: string // multiple_choice, essay, true_false
    voptions?: string // JSON string with {A, B, C, D} for multiple choice
    vanswer_key?: string
    vcorrect_answer?: string
    npoints: number
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
}

export interface CreateQuestionBankRequest {
    vsubject: string
    vquestion: string
    vtype: string
    joptions?: {
        A?: string
        B?: string
        C?: string
        D?: string
        guide?: string
        true_text?: string
        false_text?: string
    }
    vcorrect_answer?: string
    npoints: number
    nstatus?: number
}

export interface UpdateQuestionBankRequest {
    vsubject?: string
    vquestion?: string
    vtype?: string
    joptions?: {
        A?: string
        B?: string
        C?: string
        D?: string
        guide?: string
    }
    vcorrect_answer?: string
    npoints?: number
    nstatus?: number
}

export interface QuestionBankListResponse extends ApiResponse<QuestionBank> { }
