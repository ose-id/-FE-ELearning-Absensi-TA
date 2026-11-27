// import type { Role } from './user'

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    token: string
    userId: string
    name: string
    email: string
    // roles: Role[]
}
