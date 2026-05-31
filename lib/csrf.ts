import { randomBytes, createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

const CSRF_SECRET = process.env.AUTH_SECRET || 'fallback-dev-only'

export function generateCsrfToken(): string {
  const timestamp = Date.now().toString(36)
  const random = randomBytes(16).toString('hex')
  const payload = `${timestamp}.${random}`
  const signature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex').slice(0, 16)
  return `${payload}.${signature}`
}

export function validateCsrfToken(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = `${parts[0]}.${parts[1]}`
    const signature = parts[2]

    const expectedSig = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex').slice(0, 16)

    if (signature.length !== expectedSig.length) return false
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  } catch {
    return false
  }
}

export function setCsrfCookie(response: Response) {
  const token = generateCsrfToken()
  response.headers.set(
    'Set-Cookie',
    `csrf_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  )
}

export function getCsrfTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match?.[1] || null
}

export function requireCsrf(request: Request): NextResponse | null {
  const token = request.headers.get('x-csrf-token')
  if (!token) {
    return NextResponse.json({ error: 'CSRF token requerido' }, { status: 403 })
  }

  if (!validateCsrfToken(token)) {
    return NextResponse.json({ error: 'CSRF token inválido' }, { status: 403 })
  }

  return null
}
