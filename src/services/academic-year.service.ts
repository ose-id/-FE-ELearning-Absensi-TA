import { ApiResponse } from '@/types/auth-api'

const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:5003'

export interface AcademicYear {
    nid: number
    vacademic_year_name: string
    dstart_date?: string
    dend_date?: string
    nstatus: number
    dcrea?: string
    vcrea?: string
    dmodi?: string
    vmodi?: string
}

export interface CreateAcademicYearRequest {
    AcademicYearName: string
    StartDate?: string
    EndDate?: string
}

export interface UpdateAcademicYearRequest {
    AcademicYearName: string
    StartDate?: string
    EndDate?: string
    Status?: number
}

class AcademicYearService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${CLASS_API_URL}/api/AcademicYear`
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

    async createAcademicYear(data: CreateAcademicYearRequest, token: string): Promise<AcademicYear> {
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async getAcademicYearById(id: number, token: string): Promise<AcademicYear | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return response.data[0]
        } catch {
            return null
        }
    }

    async getAllAcademicYears(
        token: string,
        pageNumber = 1,
        pageSize = 10,
        search?: string
    ): Promise<{ data: AcademicYear[], totalRecords: number }> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (search) params.append('search', search)

        const response = await this.fetchWithAuth(`${this.baseUrl}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async updateAcademicYear(id: number, data: UpdateAcademicYearRequest, token: string): Promise<AcademicYear> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response.data[0]
    }

    async deleteAcademicYear(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const academicYearService = new AcademicYearService()