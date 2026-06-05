
export const ROLES = {
    ADMIN: 'ADM',
    TEACHER: 'GR',
    STUDENT: 'MR',
} as const

export type RoleCode = (typeof ROLES)[keyof typeof ROLES]
