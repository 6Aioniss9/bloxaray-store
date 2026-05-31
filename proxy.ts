import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

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

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|backgrounds/|fruits/).*)',
  ],
}
