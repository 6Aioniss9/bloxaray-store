import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PATH = '/admin'
const API_AUTH_PATH = '/api/auth'
const API_WEBHOOK = '/api/webhook'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ── Security Headers ──
  // unsafe-eval removed — framer-motion does NOT need it in production builds.
  // unsafe-inline for scripts: required by Next.js hydration (inline <script> tags).
  // unsafe-inline for styles: required by Tailwind JIT in dev.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.discordapp.com https://avatars.githubusercontent.com",
    "media-src 'self' blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://api.discord.com wss:",
    "frame-src 'self' https://*.mercadopago.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.mercadopago.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '0')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self "https://*.mercadopago.com")')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  // ── Admin route protection via NextAuth ──
  if (pathname.startsWith(ADMIN_PATH) && !pathname.startsWith(API_AUTH_PATH)) {
    const session = await auth()

    if (!session?.user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    if (!session.user.isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/403'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|backgrounds/|fruits/).*)',
  ],
}
