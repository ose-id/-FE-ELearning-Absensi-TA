// NextAuth Configuration
// Integrates with .NET AuthService backend

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { JWT } from 'next-auth/jwt'
import authService from '@/services/auth.service'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required')
                }

                try {
                    console.log('[NextAuth] Attempting login for:', credentials.email)

                    const response = await authService.login({
                        email: credentials.email,
                        password: credentials.password,
                    })

                    console.log('[NextAuth] Login response received:', {
                        status: response.status,
                        hasData: !!response.data && response.data.length > 0,
                        hasToken: !!response.data?.[0]?.token,
                    })

                    if (response.status === '1' && response.data && response.data.length > 0) {
                        const userData = response.data[0]

                        // ── Full debug: see what the login API actually returns ──
                        console.log('[NextAuth] Full userData from API:', JSON.stringify(userData, null, 2))

                        const id        = userData.nid      || userData.id       || 0
                        const fullName  = userData.fullname || userData.fullName || userData.username || 'User'
                        const role_nid  = userData.role_nid || userData.role_id  || 0
                        const vrole_name = userData.vrole_name || userData.role_name || 'User'

                        // Try every possible field name the backend might return
                        let vrole_code: string =
                            userData.vrole_code  ||
                            userData.role_code   ||
                            ''

                        // Fallback: derive from role_nid if backend didn't return a code
                        if (!vrole_code && role_nid) {
                            if (role_nid === 1)      vrole_code = 'ADM'
                            else if (role_nid === 2) vrole_code = 'GR'
                            else if (role_nid === 3) vrole_code = 'MR'
                        }

                        console.log('[NextAuth] Resolved vrole_code:', vrole_code, '| role_nid:', role_nid)

                        return {
                            id: id.toString(),
                            email: userData.email,
                            username: userData.username,
                            fullName: fullName,
                            role_nid: role_nid,
                            vrole_name: vrole_name,
                            vrole_code: vrole_code,
                            isActive: true,
                            accessToken: userData.token,
                            refreshToken: '',
                            expiresIn: 3600,
                        }
                    }

                    const errorMsg = typeof response.message?.Error === 'string'
                        ? response.message.Error
                        : 'Authentication failed'
                    throw new Error(errorMsg)
                } catch (error: any) {
                    console.error('[NextAuth] Login error:', error)
                    throw new Error(error.message || 'Authentication failed')
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user, trigger, session }): Promise<JWT> {
            // Initial sign in
            if (user) {
                console.log('[NextAuth JWT] Initial sign in, storing user data in token')
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    fullName: user.fullName,
                    role_nid: user.role_nid,
                    vrole_name: user.vrole_name,
                    vrole_code: user.vrole_code,
                    isActive: user.isActive,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    expiresIn: user.expiresIn,
                }
            }

            // Handle session update
            if (trigger === 'update' && session) {
                console.log('[NextAuth JWT] Session update triggered')
                return { ...token, ...session }
            }

            // Check if token is expired and refresh it
            const now = Math.floor(Date.now() / 1000)
            const tokenExpiresAt = token.iat + (token.expiresIn || 3600)

            if (now < tokenExpiresAt) {
                console.log('[NextAuth JWT] Token still valid')
                return token
            }

            console.log('[NextAuth JWT] Token expired, attempting refresh')

            try {
                const refreshResponse = await authService.refreshToken({
                    token: token.accessToken,
                    refreshToken: token.refreshToken,
                })

                if (refreshResponse.status === '1' && refreshResponse.data && refreshResponse.data.length > 0) {
                    console.log('[NextAuth JWT] Token refreshed successfully')
                    const tokenData = refreshResponse.data[0]
                    return {
                        ...token,
                        accessToken: tokenData.token,
                        refreshToken: tokenData.refresh_token,
                        expiresIn: tokenData.expires_in,
                        iat: now,
                    }
                }

                throw new Error('Token refresh failed')
            } catch (error) {
                console.error('[NextAuth JWT] Token refresh error:', error)
                // Return token with expired flag
                return { ...token, error: 'RefreshTokenError' }
            }
        },

        async session({ session, token }) {
            // Attach token data to session
            if (token) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    username: token.username,
                    fullName: token.fullName,
                    role_nid: token.role_nid,
                    vrole_name: token.vrole_name,
                    vrole_code: token.vrole_code,
                    isActive: token.isActive,
                }
                session.accessToken = token.accessToken
                session.refreshToken = token.refreshToken
                session.expiresIn = token.expiresIn
            }

            return session
        },
    },

    pages: {
        signIn: '/',
        error: '/',
    },

    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },

    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}