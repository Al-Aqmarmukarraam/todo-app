import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname === '/' ||
    pathname.startsWith('/api/auth') // Allow auth API routes
  ) {
    return NextResponse.next()
  }

  // Protect all other routes
  const token = req.cookies.get('auth_token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - login, signup, home page
     */
    '/((?!_next|login|signup|api/auth).*)',
  ]
}
