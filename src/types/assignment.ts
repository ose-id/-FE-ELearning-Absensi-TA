
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
    content?: string
    filePath?: string
    fileName?: string
}

export interface GradeSubmissionRequest {
    score: number
    feedback?: string
}

export type AssignmentListResponse = ApiResponse<Assignment>
export type SubmissionListResponse = ApiResponse<Submission>

export interface RawAssignment {
    nid: number
    vtitle?: string
    vdescription?: string
    class_id?: number
    nid_learning_module: number
    dsubmission?: string
    LearningModule?: {
        nid_class?: number
    }
}

export interface RawSubmission {
    nid: number
    nid_assignment: number
    nid_student: number
    vcontent?: string
    vfile_path?: string
    vfile_name?: string
    nscore: number
    vfeedback?: string
    dsubmitted_at: string
    nis_late: number
    vcrea?: string
    vmodi?: string
    Student?: {
        vname?: string
        vfull_name?: string
    }
}

export type AssignmentSubmission = RawSubmission
