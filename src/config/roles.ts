
export const ROLES = {
    ADMIN: 'Adm',
    TEACHER: 'TCR',
    STUDENT: 'STD',
} as const

export type RoleCode = (typeof ROLES)[keyof typeof ROLES]
