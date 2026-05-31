import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, createOrderSchema } from '@/lib/security'
import { rateLimitIP } from '@/lib/rate-limit'
import { createSecureResponse } from '@/lib/api-security'
import { sendOrderNotification } from '@/lib/discord-webhook'
import { requireAdmin } from '@/lib/admin'

function expectJson(request: Request): boolean {
  return (request.headers.get('content-type') || '').includes('application/json')
}

function checkBodySize(request: Request, maxBytes: number): NextResponse | null {
  const cl = request.headers.get('content-length')
  if (cl && parseInt(cl, 10) > maxBytes) {
    return NextResponse.json({ error: 'Cuerpo de solicitud demasiado grande' }, { status: 413 })
  }
  return null
}

const POST_RATE = 10, POST_WINDOW = 60000
const GET_RATE = 60, GET_WINDOW = 60000
const POST_MAX_BODY = 1024 * 10

export async function POST(request: Request) {
  try {
    const rl = rateLimitIP(request, POST_RATE, POST_WINDOW)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en 1 minuto.' }, {
        status: 429, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '60' },
      })
    }

    if (!expectJson(request)) {
      return NextResponse.json({ error: 'Content-Type debe ser application/json' }, { status: 415 })
    }

    const sizeCheck = checkBodySize(request, POST_MAX_BODY)
    if (sizeCheck) return sizeCheck

    const body = await request.json()

    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return NextResponse.json({ error: firstError?.message || 'Datos inválidos' }, { status: 400 })
    }

    const { items, customerName, customerEmail, customerRoblox, customerDiscord, customerNotes, paymentMethod } = parsed.data
    const name = sanitizeInput(customerName)
    const email = sanitizeInput(customerEmail)
    const roblox = sanitizeInput(customerRoblox)
    const discord = sanitizeInput(customerDiscord)
    const notes = customerNotes ? sanitizeInput(customerNotes) : null

    const fruitIds = [...new Set(items.map((i: any) => i.fruitId))]
    const dbFruits = await prisma.fruit.findMany({ where: { id: { in: fruitIds } } })
    const fruitMap = new Map(dbFruits.map((f) => [f.id, f]))

    let serverTotal = 0
    let serverTotalUSD = 0
    for (const item of items) {
      const fruit = fruitMap.get(item.fruitId)
      if (!fruit) return NextResponse.json({ error: `Fruta no encontrada: ${item.fruitId}` }, { status: 400 })
      if (fruit.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para "${fruit.name}"` }, { status: 400 })
      }
      serverTotal += fruit.price * item.quantity
      serverTotalUSD += fruit.priceUSD * item.quantity
    }

    const order = await prisma.order.create({
      data: {
        items: JSON.stringify(items),
        total: serverTotal,
        totalUSD: serverTotalUSD,
        status: 'pending_manual_review',
        paymentMethod,
        customerName: name,
        customerEmail: email,
        customerRoblox: roblox,
        customerDiscord: discord,
        customerNotes: notes,
      },
    })

    sendOrderNotification(order, 'created').catch(() => {})

    return createSecureResponse({
      success: true,
      orderId: order.id,
      message: 'Pedido creado. Te contactaremos por Discord para confirmar.',
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Error desconocido'
    if (process.env.NODE_ENV !== 'production') console.error('[API] Error:', errMsg)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const rl = rateLimitIP(request, GET_RATE, GET_WINDOW)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const order = await prisma.order.findUnique({ where: { id } })
      if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
      return createSecureResponse({
        id: order.id, status: order.status, total: order.total,
        paymentMethod: order.paymentMethod, createdAt: order.createdAt,
      })
    }

    const guard = await requireAdmin()
    if (guard instanceof NextResponse) return guard

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)))

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, items: true, total: true, totalUSD: true,
          status: true, paymentMethod: true, paymentId: true,
          customerName: true, customerEmail: true,
          customerRoblox: true, customerDiscord: true,
          customerNotes: true, receiptUrl: true, createdAt: true,
        },
      }),
      prisma.order.count(),
    ])

    return createSecureResponse({ orders, total, page, pageSize })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Error desconocido'
    if (process.env.NODE_ENV !== 'production') console.error('[API] Error:', errMsg)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const guard = await requireAdmin()
    if (guard instanceof NextResponse) return guard

    if (!expectJson(request)) {
      return NextResponse.json({ error: 'Content-Type debe ser application/json' }, { status: 415 })
    }

    const sizeCheck = checkBodySize(request, 1024 * 10)
    if (sizeCheck) return sizeCheck

    const body = await request.json()
    const { id, status } = body

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const validStates = ['pending_payment', 'paid', 'pending_manual_review', 'delivered', 'cancelled', 'refunded']
    if (status && !validStates.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (body.receiptUrl) updateData.receiptUrl = body.receiptUrl
    if (body.paymentId) updateData.paymentId = body.paymentId

    await prisma.order.update({ where: { id }, data: updateData })
    return createSecureResponse({ success: true })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Error desconocido'
    if (process.env.NODE_ENV !== 'production') console.error('[API] Error:', errMsg)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
