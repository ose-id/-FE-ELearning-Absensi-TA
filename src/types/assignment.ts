
import { ApiResponse } from './auth-api'

export interface Assignment {
    id: number
    title: string
    description: string
    class_id: number
    class_name?: string
    learning_module_id: number
    learning_module_name?: string
    due_date: string
    max_score: number
    created_at?: string
    updated_at?: string
}

export interface Submission {
    id: number
    assignment_id: number
    student_id: number
    student_name?: string
    file_url?: string
    submitted_at: string
    score?: number
    feedback?: string
    status: 'pending' | 'graded'
}

export interface CreateAssignmentRequest {
    title: string
    description: string
    learningModuleId: number
    dueDate: string
    allowLateSubmission?: boolean
    enableCutoff?: boolean
}

export interface UpdateAssignmentRequest {
    title: string
    description: string
    dueDate: string
    allowLateSubmission?: boolean
    enableCutoff?: boolean
    status: number
}

export interface SubmitAssignmentRequest {
    assignment_id: number
    file_url?: string
}

export interface GradeSubmissionRequest {
    score: number
    feedback?: string
}

export interface AssignmentListResponse extends ApiResponse<Assignment> { }
export interface SubmissionListResponse extends ApiResponse<Submission> { }
