import { authService } from './auth.service'
import { Role, CreateRoleRequest, UpdateRoleRequest, RoleListResponse } from '@/types/role'
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '@/types/user'

// Use NEXT_PUBLIC environment variable for client-side API URL
// Must be set in .env.local or .env file: NEXT_PUBLIC_AUTH_API_URL=https://localhost:5001
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://localhost:5001'
const CLASS_API_URL = process.env.NEXT_PUBLIC_CLASS_API_URL || 'https://localhost:5003'

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

            // Helper to convert potential .NET validation errors into readable strings
            const parseErrorMessage = (data: any): string => {
                if (typeof data === 'string') return data;

                // Case 1: FluentValidation style { errors: { FieldName: ["Error Msg"] } }
                if (data.errors && typeof data.errors === 'object') {
                    return Object.entries(data.errors)
                        .map(([field, messages]) => {
                            const msg = Array.isArray(messages) ? messages[0] : messages;
                            return `${field}: ${msg}`;
                        })
                        .join(', ');
                }

                // Case 2: Standard { message: "..." } or { title: "..." }
                return data.message?.message ||
                       data.message?.Message ||
                       data.message ||
                       data.title ||
                       `API request failed (${res.status})`;
            };

            throw new Error(parseErrorMessage(errorData))
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

        // Override endpoint based on role - for Guru (role 2), use /api/Teacher
        // Not /api/User/staff because we need Teacher profile for Learning Module
        let endpoint: string
        if (roleNid === 2) {
            // Guru: use /api/Teacher to create both User and Teacher profile
            endpoint = `${this.baseUrl}/Teacher`
        } else {
            endpoint = this.getEndpointByRole(roleNid)
        }

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
                // class_id is optional - student can enroll in classes later via class code
                // Only send if it's a valid number > 0
                ...(data.class_id && Number(data.class_id) > 0 ? { class_id: Number(data.class_id) } : {}),
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

    // Creates profile in Class API (LMS_ClassDB database) - for Student and Teacher
    async createProfileInClassDb(data: any, token: string): Promise<void> {
        const roleNid = data.role_nid || data.role_id

        // Student (3) and Teacher (2) need profile in ClassDB
        if (roleNid !== 2 && roleNid !== 3) {
            console.log('[UserService] Role does not need ClassDB profile, skipping...')
            return
        }

        const endpoint = roleNid === 2 ? `${this.classBaseUrl}/Teacher` : `${this.classBaseUrl}/Student`

        console.log(`[UserService] Creating profile in ClassDB via ${endpoint}...`)

        let profileData: any
        if (roleNid === 2) {
            // Teacher payload for ClassDB
            profileData = {
                username:  data.username,
                email:     data.email,
                fullname:  data.fullname || '',
                birthdate: data.birthdate || '',
                address:   data.address || '',
                phone:     data.phone || '',
                whatsapp:  data.whatsapp || '',
                nip:       data.nik || data.nip || '',
                degree:    data.degree || '',
                status:    data.status || 'active',
            }
        } else {
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
        }

        await this.fetchWithAuth(endpoint, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(profileData),
        })
    }

    // Creates user in Auth API (LMS_Auth)
    // Note: ClassDB profile is automatically created by backend when creating user in Auth API
    async createUser(data: any, token: string): Promise<void> {
        // Step 1: Create profile in Auth API (LMS_Auth)
        // Backend will automatically create ClassDB profile
        await this.createProfile(data, token)
        console.log('[UserService] User created successfully (ClassDB profile auto-created by backend)')
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

        // Include password if provided (for password change)
        if (data.password) {
            updatedData.password = data.password
        }

        await this.fetchWithAuth(`${endpoint}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(updatedData),
        })
    }

    // Change password via Auth API
    async changePassword(userId: number, newPassword: string, token: string): Promise<void> {
        const authEndpoint = `${AUTH_API_URL}/api/Auth/changepassword`

        const response = await fetch(authEndpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: userId,
                newPassword: newPassword,
            }),
        })

        if (!response.ok) {
            const result = await response.json().catch(() => ({}))
            throw new Error(result.message || 'Failed to change password')
        }
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
