import { NextResponse } from 'next/server'
import { rateLimitIP } from './rate-limit'
import { expectJson, validateBodySize, MAX_BODY_SIZE } from './security'
import { getEnv, isProduction } from './env'
import { getCsrfTokenFromRequest, validateCsrfToken } from './csrf'

export type ApiHandler<T = unknown> = (request: Request, params?: T) => Promise<NextResponse>

type ApiOptions = {
  rateLimit?: { maxRequests?: number; windowMs?: number } | false
  requireJson?: boolean
  maxBodySize?: number
  requireCsrf?: boolean
}

export function createSafeHandler(handler: ApiHandler, options: ApiOptions = {}): ApiHandler {
  return async (request: Request, params?: any) => {
    try {
      // Rate limiting
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

      // Content-Type enforcement for POST/PUT/PATCH
      if (options.requireJson !== false && request.method !== 'GET' && request.method !== 'DELETE') {
        if (!expectJson(request)) {
          return NextResponse.json({ error: 'Content-Type debe ser application/json' }, { status: 415 })
        }
      }

      // Body size limit
      const contentType = request.headers.get('content-type') || ''
      if (options.maxBodySize !== undefined && request.method !== 'GET' && !contentType.includes('multipart')) {
        try {
          const clone = request.clone()
          const text = await clone.text()
          if (!validateBodySize(text, options.maxBodySize)) {
            return NextResponse.json({ error: 'Cuerpo de solicitud demasiado grande' }, { status: 413 })
          }
        } catch {
          // body already consumed
        }
      }

      return handler(request, params)
    } catch (error: any) {
      console.error('[API] Error no manejado:', error?.message || error)

      const msg = isProduction()
        ? 'Error interno del servidor'
        : error?.message || 'Error desconocido'

      return NextResponse.json({ error: msg }, { status: 500 })
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
