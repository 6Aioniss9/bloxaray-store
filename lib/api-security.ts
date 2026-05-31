import { NextResponse } from 'next/server'
import { rateLimitIP } from './rate-limit'
import { expectJson, validateBodySize } from './security'
import { requireCsrf } from './csrf'

export type ApiHandler<T = unknown> = (request: Request, params?: T) => Promise<NextResponse>

type ApiOptions = {
  rateLimit?: { maxRequests?: number; windowMs?: number } | false
  requireJson?: boolean
  maxBodySize?: number
  requireCsrf?: boolean
}

function checkBodySize(request: Request, maxBytes: number): NextResponse | null {
  const cl = request.headers.get('content-length')
  if (cl && parseInt(cl, 10) > maxBytes) {
    return NextResponse.json({ error: 'Cuerpo de solicitud demasiado grande' }, { status: 413 })
  }
  return null
}

export function createSafeHandler(handler: ApiHandler, options: ApiOptions = {}): ApiHandler {
  return async (request: Request, params?: unknown) => {
    try {
      const rateLimitOpts = options.rateLimit
      if (rateLimitOpts !== false) {
        const rl = rateLimitOpts || {}
        const { allowed, remaining } = rateLimitIP(request, rl.maxRequests ?? 30, rl.windowMs ?? 60000)
        if (!allowed) {
          return NextResponse.json(
            { error: 'Demasiadas solicitudes. Intenta en 1 minuto.' },
            {
              status: 429,
              headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '60' },
            }
          )
        }
      }

      if (options.requireJson !== false && request.method !== 'GET' && request.method !== 'DELETE') {
        if (!expectJson(request)) {
          return NextResponse.json({ error: 'Content-Type debe ser application/json' }, { status: 415 })
        }
      }

      if (options.maxBodySize !== undefined && request.method !== 'GET') {
        const sizeCheck = checkBodySize(request, options.maxBodySize)
        if (sizeCheck) return sizeCheck
      }

      if (options.requireCsrf && request.method !== 'GET') {
        const csrfResult = requireCsrf(request)
        if (csrfResult) return csrfResult
      }

      return handler(request, params)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Error desconocido'
      if (process.env.NODE_ENV !== 'production') {
        console.error('[API] Error no manejado:', errMsg)
      }

      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
  }
}

export function createSecureResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
