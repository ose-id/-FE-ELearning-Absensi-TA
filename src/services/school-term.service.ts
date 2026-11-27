import { ApiResponse } from '@/types/auth-api'

const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:5003'

export interface SchoolTerm {
    nid: number
    vterm_name: string
    nid_academic_year: number
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
    AcademicYear?: {
        nid: number
        vacademic_year_name: string
    }
}

export interface CreateSchoolTermRequest {
    TermName: string
    AcademicYearId: number
}

export interface UpdateSchoolTermRequest {
    TermName: string
    AcademicYearId: number
    Status?: number
}

class SchoolTermService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${CLASS_API_URL}/api/SchoolTerm`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
        }
        return res.json()
    }

    async createSchoolTerm(data: CreateSchoolTermRequest, token: string): Promise<SchoolTerm> {
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async getSchoolTermById(id: number, token: string): Promise<SchoolTerm | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async getAllSchoolTerms(
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string,
        academicYearId?: number
    ): Promise<{ data: SchoolTerm[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)
        if (academicYearId) params.append('academicYearId', academicYearId.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async updateSchoolTerm(id: number, data: UpdateSchoolTermRequest, token: string): Promise<SchoolTerm> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteSchoolTerm(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const schoolTermService = new SchoolTermService()