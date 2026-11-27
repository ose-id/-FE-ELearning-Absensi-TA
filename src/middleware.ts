import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAuth = !!token
        const pathname = req.nextUrl.pathname

        // Allow access to login page
        if (pathname === '/') {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
            return NextResponse.next()
        }

        // Protect all other routes
        if (!isAuth) {
            const loginUrl = new URL('/', req.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Return true to allow the middleware function to run
                // Return false to redirect to login
                return true // We handle authorization in the middleware function above
            },
        },
        pages: {
            signIn: '/',
        },
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)',
    ],
}
