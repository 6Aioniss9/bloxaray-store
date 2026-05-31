import { randomBytes, createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

function getCsrfSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    console.error('[CSRF] AUTH_SECRET no está configurado o es muy corto. Los tokens CSRF no son seguros.')
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET es requerido para la seguridad CSRF en producción')
    }
    return 'dev-csrf-secret-not-secure'
  }
  return secret
}

const CSRF_MAX_AGE = 2 * 60 * 60 * 1000 // 2 hours

function getSecret(): string {
  return getCsrfSecret()
}

export function generateCsrfToken(): string {
  const secret = getSecret()
  const timestamp = Date.now().toString(36)
  const random = randomBytes(16).toString('hex')
  const payload = `${timestamp}.${random}`
  const signature = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16)
  return `${payload}.${signature}`
}

export function validateCsrfToken(token: string): boolean {
  try {
    const secret = getSecret()
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const timestamp = parseInt(parts[0], 36)
    if (Date.now() - timestamp > CSRF_MAX_AGE) return false

    const payload = `${parts[0]}.${parts[1]}`
    const signature = parts[2]

    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16)

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
    return NextResponse.json({ error: 'CSRF token inválido o expirado' }, { status: 403 })
  }

  const cookieToken = getCsrfTokenFromRequest(request)
  if (!cookieToken) {
    return NextResponse.json({ error: 'Cookie CSRF no encontrada' }, { status: 403 })
  }

  if (!timingSafeEqual(Buffer.from(token), Buffer.from(cookieToken))) {
    return NextResponse.json({ error: 'CSRF token no coincide con la cookie' }, { status: 403 })
  }

  return null
}
