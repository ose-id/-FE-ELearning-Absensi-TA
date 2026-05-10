import { ApiResponse } from './auth-api'

export interface Material {
    nid: number
    vtitle: string
    vdesc?: string
    nid_learning_module: number
    vfile_path?: string
    vfile_name?: string
    vfile_type?: string
    nfile_size?: number
    nstatus: number
    dcrea?: string
    dmodi?: string
}

export interface CreateMaterialRequest {
    Title: string
    Description?: string
    LearningModuleId: number
    FilePath?: string
    FileName?: string
    FileType?: string
    FileSize?: number
}

export interface UpdateMaterialRequest {
    Title: string
    Description?: string
    FilePath?: string
    FileName?: string
    FileType?: string
    FileSize?: number
}

export interface MaterialListResponse extends ApiResponse<Material> { }
export interface MaterialDetailResponse extends ApiResponse<Material> { }
