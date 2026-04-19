// List of Values service for fetching dropdown options from backend
const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:5003'

export interface LOVItem {
    nid: number
    label: string
}

class LOVService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${CLASS_API_URL}/api`
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

    async getAcademicYears(token: string): Promise<LOVItem[]> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/AcademicYearLOV`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // If LOV returns items with nid and label directly, use them
            if (response.data && response.data[0]?.label) {
                return response.data
            }
            // Otherwise map from full response
            return (response.data || []).map((item: any) => ({
                nid: item.nid,
                label: item.vacademic_year_name || item.label || `Year ${item.nid}`
            }))
        } catch {
            // Fallback to full list endpoint
            try {
                const response = await this.fetchWithAuth(`${this.baseUrl}/AcademicYear?pageNumber=1&pageSize=100`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                return (response.data || []).map((item: any) => ({
                    nid: item.nid,
                    label: item.vacademic_year_name || item.label || `Year ${item.nid}`
                }))
            } catch {
                console.error('Failed to fetch academic years from both LOV and fallback endpoints')
                return []
            }
        }
    }

    async getSchoolTerms(token: string, academicYearId?: number): Promise<LOVItem[]> {
        try {
            const params = new URLSearchParams()
            if (academicYearId) params.append('academicYearId', academicYearId.toString())

            const url = `${this.baseUrl}/SchoolTermLOV${params.toString() ? '?' + params.toString() : ''}`
            const response = await this.fetchWithAuth(url, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data && response.data[0]?.label) {
                return response.data
            }
            return (response.data || []).map((item: any) => ({
                nid: item.nid,
                label: item.vterm_name || item.label || `Term ${item.nid}`
            }))
        } catch {
            // Fallback to full list endpoint
            try {
                const response = await this.fetchWithAuth(`${this.baseUrl}/SchoolTerm?pageNumber=1&pageSize=100`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                return (response.data || []).map((item: any) => ({
                    nid: item.nid,
                    label: item.vterm_name || item.label || `Term ${item.nid}`
                }))
            } catch {
                console.error('Failed to fetch school terms from both LOV and fallback endpoints')
                return []
            }
        }
    }

    async getClasses(token: string): Promise<LOVItem[]> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/ClassLOV`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data && response.data[0]?.label) {
                return response.data
            }
            return (response.data || []).map((item: any) => ({
                nid: item.nid,
                label: item.vname || item.label || `Class ${item.nid}`
            }))
        } catch {
            try {
                const response = await this.fetchWithAuth(`${this.baseUrl}/Class?pageNumber=1&pageSize=100`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                return (response.data || []).map((item: any) => ({
                    nid: item.nid,
                    label: item.vname || item.label || `Class ${item.nid}`
                }))
            } catch {
                console.error('Failed to fetch classes from both LOV and fallback endpoints')
                return []
            }
        }
    }

    async getDepartments(token: string): Promise<LOVItem[]> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/DepartmentLOV`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data && response.data[0]?.label) {
                return response.data
            }
            return (response.data || []).map((item: any) => ({
                nid: item.nid,
                label: item.vdepartment_name || item.label || `Dept ${item.nid}`
            }))
        } catch {
            try {
                const response = await this.fetchWithAuth(`${this.baseUrl}/Department?pageNumber=1&pageSize=100`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                return (response.data || []).map((item: any) => ({
                    nid: item.nid,
                    label: item.vdepartment_name || item.label || `Dept ${item.nid}`
                }))
            } catch {
                console.error('Failed to fetch departments from both LOV and fallback endpoints')
                return []
            }
        }
    }

    async getSubjects(token: string, departmentId?: number): Promise<LOVItem[]> {
        try {
            const params = new URLSearchParams()
            if (departmentId) params.append('departmentId', departmentId.toString())

            const url = `${this.baseUrl}/SubjectLOV${params.toString() ? '?' + params.toString() : ''}`
            const response = await this.fetchWithAuth(url, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data && response.data[0]?.label) {
                return response.data
            }
            return (response.data || []).map((item: any) => ({
                nid: item.nid,
                label: item.vsubject_name || item.label || `Subject ${item.nid}`
            }))
        } catch {
            try {
                const response = await this.fetchWithAuth(`${this.baseUrl}/Subject?pageNumber=1&pageSize=100`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                return (response.data || []).map((item: any) => ({
                    nid: item.nid,
                    label: item.vsubject_name || item.label || `Subject ${item.nid}`
                }))
            } catch {
                console.error('Failed to fetch subjects from both LOV and fallback endpoints')
                return []
            }
        }
    }
}

export const lovService = new LOVService()