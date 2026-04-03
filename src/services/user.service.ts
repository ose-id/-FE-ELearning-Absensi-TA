import { authService } from './auth.service'
import { Role, CreateRoleRequest, UpdateRoleRequest, RoleListResponse } from '@/types/role'
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '@/types/user'

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.AUTH_API_URL || 'https://localhost:7192'
const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || process.env.CLASS_API_URL || 'https://localhost:32771'

class UserService {
    private baseUrl: string
    private classBaseUrl: string

    constructor() {
        this.baseUrl = `${AUTH_API_URL}/api`
        this.classBaseUrl = `${CLASS_API_URL}/api`
    }

    private getEndpointByRole(roleNid: number): string {
        switch (roleNid) {
            case 1: // ADM
                return `${this.baseUrl}/User/staff`
            case 2: // GR
                return `${this.baseUrl}/Teacher`
            case 3: // MR
                return `${this.baseUrl}/Student`
            default:
                return `${this.baseUrl}/User/staff`
        }
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        console.log('[UserService] Request:', { url, method: options.method || 'GET', body: options.body })

        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        console.log('[UserService] Response:', { status: res.status, statusText: res.statusText })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error('[UserService] Error response:', errorData)

            const errorMessage =
                errorData.message?.message ||
                errorData.message?.Message ||
                errorData.message ||
                errorData.title ||
                errorData.errors?.[Object.keys(errorData.errors)[0]]?.[0] ||
                `API request failed (${res.status})`

            throw new Error(errorMessage)
        }
        return res.json()
    }

    // Helper to extract data from both {data: []} and direct [] responses
    private getData(res: any): any[] {
        if (Array.isArray(res)) return res
        if (res && Array.isArray(res.data)) return res.data
        return []
    }

    // Fetches all users from all role endpoints
    async getUsers(token: string): Promise<UserListResponse> {
        try {
            const [staffRes, teacherRes, studentRes] = await Promise.all([
                this.fetchWithAuth(`${this.baseUrl}/User/staff`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
                this.fetchWithAuth(`${this.baseUrl}/Teacher`,    { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
                this.fetchWithAuth(`${this.baseUrl}/Student`,    { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
            ])

            // Tag each user with their role_nid so edit/delete know which endpoint to call
            // Also create a unique composite key to avoid duplicate key warnings in React
            const tagUsers = (users: any[], roleNid: number) =>
                users.map(u => ({
                    ...u,
                    role_nid: u.role_nid ?? u.role_id ?? roleNid,
                    // Stable unique key: "role_nid:id"
                    _uid: `${roleNid}:${u.nid ?? u.id}`,
                }))

            const allUsers = [
                ...tagUsers(this.getData(staffRes),   1),
                ...tagUsers(this.getData(teacherRes), 2),
                ...tagUsers(this.getData(studentRes), 3),
            ]

            return {
                status: '1',
                data: allUsers,
                total: allUsers.length,
                message: {}
            }
        } catch (error) {
            console.error('[UserService] Failed to fetch all users:', error)
            throw error
        }
    }

    async getUserById(id: number, roleNid: number, token: string): Promise<User> {
        const endpoint = this.getEndpointByRole(roleNid)
        const response = await this.fetchWithAuth(`${endpoint}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const users = this.getData(response)
        return users[0]
    }

    // STEP 1: Register in Auth table
    async registerUser(data: any): Promise<any> {
        console.log('[UserService] Flow Step 1: Registering user via Auth API...')
        const response = await authService.register(data)
        return response
    }

    // Creates profile in Auth API (LMS_Auth database)
    async createProfile(data: any, token: string): Promise<void> {
        const roleNid = data.role_nid || data.role_id
        const endpoint = this.getEndpointByRole(roleNid)

        console.log(`[UserService] Creating user via ${endpoint}...`)

        let profileData: any

        if (roleNid === 3) {
            // ── Student payload (/api/Student) ──────────────────────────────
            profileData = {
                username:     data.username,
                email:        data.email,
                password:     data.password,
                fullname:     data.fullname || '',
                birthdate:    data.birthdate || '',
                address:      data.address || '',
                phone:        data.phone || '',
                whatsapp:     data.whatsapp || '',
                nis:          data.nis || '',
                class_id:     data.class_id ? Number(data.class_id) : 0,
                parent_name:  data.parent_name || '',
                parent_phone: data.parent_phone || '',
                status:       data.status || 'active',
            }
        } else {
            // ── Staff / Teacher payload (/api/User/staff or /api/Teacher) ───
            profileData = {
                username:  data.username,
                email:     data.email,
                password:  data.password,
                fullName:  data.fullname || '',
                fullname:  data.fullname || '',
                nip:       data.nik || data.nip || '',
                degree:    data.degree || '',
                birthdate: data.birthdate || '',
                address:   data.address || '',
                phone:     data.phone || '',
                whatsapp:  data.whatsapp || '',
                status:    data.status || 'active',
                role_nid:  roleNid,
            }
        }

        await this.fetchWithAuth(endpoint, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(profileData),
        })
    }

    // Creates profile in Class API (LMS_ClassDB database) - for Teacher and Student
    async createProfileInClassDb(data: any, token: string): Promise<void> {
        const roleNid = data.role_nid || data.role_id

        // Only Teacher (2) and Student (3) need profile in ClassDB
        if (roleNid === 1) {
            console.log('[UserService] Admin does not need ClassDB profile')
            return
        }

        const endpoint = roleNid === 3
            ? `${this.classBaseUrl}/Student`
            : `${this.classBaseUrl}/Teacher`

        console.log(`[UserService] Creating profile in ClassDB via ${endpoint}...`)

        let profileData: any

        if (roleNid === 3) {
            // Student payload for ClassDB
            profileData = {
                username:    data.username,
                email:       data.email,
                fullname:    data.fullname || '',
                birthdate:   data.birthdate || '',
                address:     data.address || '',
                phone:       data.phone || '',
                whatsapp:    data.whatsapp || '',
                nis:         data.nis || '',
                class_id:    data.class_id ? Number(data.class_id) : 0,
                parent_name: data.parent_name || '',
                parent_phone: data.parent_phone || '',
                status:      data.status || 'active',
            }
        } else {
            // Teacher payload for ClassDB
            profileData = {
                username:  data.username,
                email:     data.email,
                fullname:  data.fullname || '',
                fullName:  data.fullname || '',
                nip:       data.nik || data.nip || '',
                degree:    data.degree || '',
                birthdate: data.birthdate || '',
                address:   data.address || '',
                phone:     data.phone || '',
                whatsapp:  data.whatsapp || '',
                status:    data.status || 'active',
            }
        }

        await this.fetchWithAuth(endpoint, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(profileData),
        })
    }

    // Creates user in BOTH Auth API (LMS_Auth) AND Class API (LMS_ClassDB)
    async createUser(data: any, token: string): Promise<void> {
        try {
            // Step 1: Create profile in Auth API (LMS_Auth)
            await this.createProfile(data, token)

            // Step 2: Create profile in Class API (LMS_ClassDB) for Teacher/Student
            await this.createProfileInClassDb(data, token)

            console.log('[UserService] User created successfully in both Auth and ClassDB')
        } catch (error: any) {
            console.error('[UserService] createUser flow error:', error)
            throw error
        }
    }

    async updateUser(id: number, roleNid: number, data: any, token: string): Promise<void> {
        const endpoint = this.getEndpointByRole(roleNid)

        let updatedData: any
        if (roleNid === 3) {
            updatedData = {
                ...data,
                nis:          data.nis || '',
                class_id:     data.class_id ? Number(data.class_id) : 0,
                parent_name:  data.parent_name || '',
                parent_phone: data.parent_phone || '',
            }
        } else {
            updatedData = {
                ...data,
                nip: data.nik || data.nip || '',
            }
        }

        await this.fetchWithAuth(`${endpoint}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(updatedData),
        })
    }

    async deleteUser(id: number, roleNid: number, token: string): Promise<void> {
        const endpoint = this.getEndpointByRole(roleNid)
        await this.fetchWithAuth(`${endpoint}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }
}

export const userService = new UserService()
