
export const ROLES = {
    ADMIN: 'ADM',
    TEACHER: 'GR',
    STUDENT: 'MR',
} as const

export type RoleCode = (typeof ROLES)[keyof typeof ROLES]

export const getNormalizedRole = (role?: string): RoleCode => {
    switch (role?.toUpperCase()) {
        case 'ADMIN':
        case 'ADM':
            return ROLES.ADMIN
        case 'TEACHER':
        case 'GURU':
        case 'TCR':
        case 'GR':          // ← backend code for Guru
            return ROLES.TEACHER
        case 'STUDENT':
        case 'MURID':
        case 'STD':
        case 'MR':          // ← backend code for Murid
            return ROLES.STUDENT
        default:
            return ROLES.STUDENT
    }
}

