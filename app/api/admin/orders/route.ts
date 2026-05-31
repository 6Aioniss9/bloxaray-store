import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { rateLimitIP } from '@/lib/rate-limit'
import { requireCsrf } from '@/lib/csrf'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(request: Request) {
  const rl = rateLimitIP(request, 30, 60000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
  }

  const guard = await requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)))

    const where = status ? { status: status as string } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, pageSize })
  } catch (error) {
    console.error('[ADMIN/ORDERS] GET error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

const UpdateOrderSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['pending_payment', 'paid', 'pending_manual_review', 'delivered', 'cancelled', 'refunded']),
})

export async function PATCH(request: Request) {
  const rl = rateLimitIP(request, 30, 60000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
  }

  const guard = await requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  // CSRF required only for session-based requests (not API key)
  const usesApiKey = !!(request.headers.get('x-api-key'))
  if (!usesApiKey) {
    const csrfResult = requireCsrf(request)
    if (csrfResult) return csrfResult
  }

  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = UpdateOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 })
    }

    const { orderId, status } = parsed.data

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paidAt: status === 'paid' && !order.paidAt ? new Date() : undefined,
      },
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('[ADMIN/ORDERS] PATCH error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
