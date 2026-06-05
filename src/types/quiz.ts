import { ApiResponse } from './auth-api'

export interface Quiz {
    nid: number
    vtitle: string
    vdesc?: string
    nid_learning_module: number
    learning_module_name?: string
    nid_class?: number
    class_name?: string
    nduration: number // dalam menit
    nmax_score: number
    npassing_score?: number
    nstatus: number // 0: draft, 1: active
    nmax_attempts?: number
    nshow_results?: number // 0: hide score, 1: show score
    dstart?: string // tanggal mulai
    dend?: string // tanggal selesai
    dcrea?: string
    dmodi?: string
}

export interface QuizQuestion {
    nid: number
    nid_quiz: number
    norder: number
    vquestion: string
    vtype: 'multiple_choice' | 'true_false' | 'essay'
    npoints: number
    vanswer_key?: string // jawaban benar untuk objektif
    voptions?: string // JSON array of options
    dcrea?: string
    dmodi?: string
}

export interface QuizOption {
    id: string
    text: string
    isCorrect: boolean
}

export interface StudentQuizAttempt {
    nid: number
    nid_quiz: number
    nid_student: number
    student_name?: string
    dstart?: string
    dend?: string
    nscore?: number
    nstatus: number // 0: not started, 1: in progress, 2: completed
}

export interface QuizAnswer {
    question_id: number
    answer: string
    is_correct?: boolean
    points_earned?: number
}

export interface CreateQuizRequest {
    Title: string
    Description?: string
    LearningModuleId: number
    ClassId?: number
    Duration: number
    MaxScore: number
    PassingScore?: number
    Status?: number
    StartDate?: string
    EndDate?: string
    ShowResults?: number
    nshow_results?: number
}

export interface UpdateQuizRequest {
    Title: string
    Description?: string
    Duration: number
    MaxScore: number
    PassingScore?: number
    Status?: number
    StartDate?: string
    EndDate?: string
    ShowResults?: number
    nshow_results?: number
}

export interface CreateQuestionRequest {
    QuizId: number
    Order: number
    Question: string
    Type: 'multiple_choice' | 'true_false' | 'essay'
    Points: number
    AnswerKey?: string
    Options?: string // JSON string
}

export interface UpdateQuestionRequest {
    Order: number
    Question: string
    Type: 'multiple_choice' | 'true_false' | 'essay'
    Points: number
    AnswerKey?: string
    Options?: string
}

export interface SubmitQuizRequest {
    QuizId: number
    Answers: QuizAnswer[]
}

export type QuizListResponse = ApiResponse<Quiz>
export type QuizDetailResponse = ApiResponse<Quiz>
export type QuestionListResponse = ApiResponse<QuizQuestion>
export type AttemptListResponse = ApiResponse<StudentQuizAttempt>
