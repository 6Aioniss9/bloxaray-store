import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security'
import { createOrderSchema } from '@/lib/security'
import { createSafeHandler, createSecureResponse } from '@/lib/api-security'
import { sendOrderNotification } from '@/lib/discord-webhook'

const validMethods = ['mercadopago', 'yape', 'plin', 'binance']

export const POST = createSafeHandler(async (request: Request) => {
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

  // Validate against DB
  let serverTotal = 0
  for (const item of items) {
    const fruit = await prisma.fruit.findUnique({ where: { id: item.fruitId } })
    if (!fruit) return NextResponse.json({ error: `Fruta "${item.name}" no encontrada` }, { status: 400 })
    if (fruit.stock < item.quantity) {
      return NextResponse.json({ error: `Stock insuficiente para "${item.name}"` }, { status: 400 })
    }
    if (Math.abs(fruit.price - item.price) > 0.01) {
      return NextResponse.json({ error: `Precio inválido para "${item.name}"` }, { status: 400 })
    }
    serverTotal += fruit.price * item.quantity
  }

  if (Math.abs(serverTotal - body.total) > 0.01) {
    return NextResponse.json({ error: 'Total inválido' }, { status: 400 })
  }

  const order = await prisma.order.create({
    data: {
      items: JSON.stringify(items),
      total: serverTotal,
      totalUSD: body.totalUSD || 0,
      status: 'pending_manual_review',
      paymentMethod,
      customerName: name,
      customerEmail: email,
      customerRoblox: roblox,
      customerDiscord: discord,
      customerNotes: notes,
    },
  })

  sendOrderNotification(order, 'created')

  return createSecureResponse({
    success: true,
    orderId: order.id,
    message: 'Pedido creado. Te contactaremos por Discord para confirmar.',
  })
}, {
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  maxBodySize: 1024 * 10,
})

export const GET = createSafeHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    // Strip sensitive fields
    return createSecureResponse({
      id: order.id,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, items: true, total: true, totalUSD: true,
      status: true, paymentMethod: true, paymentId: true,
      customerName: true, customerEmail: true,
      customerRoblox: true, customerDiscord: true,
      customerNotes: true, receiptUrl: true, createdAt: true,
    },
  })

  return createSecureResponse(orders)
}, {
  rateLimit: { maxRequests: 60, windowMs: 60000 },
})

export const PATCH = createSafeHandler(async (request: Request) => {
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

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  })

  return createSecureResponse({ success: true })
}, {
  rateLimit: { maxRequests: 30, windowMs: 60000 },
  maxBodySize: 1024 * 10,
})
