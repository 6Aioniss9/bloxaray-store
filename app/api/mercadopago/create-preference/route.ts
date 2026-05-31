import { NextResponse } from 'next/server'
import { preference } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security'
import { createPreferenceSchema } from '@/lib/security'
import { createSafeHandler } from '@/lib/api-security'
import { sendOrderNotification } from '@/lib/discord-webhook'

function getOrigin(request: Request): string {
  return (
    request.headers.get('origin') ??
    request.headers.get('referer')?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'
  )
}

export const POST = createSafeHandler(async (request: Request) => {
  const body = await request.json()

  // Validate input with Zod
  const parsed = createPreferenceSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return NextResponse.json({ error: firstError?.message || 'Datos inválidos' }, { status: 400 })
  }

  const { items, customerName, customerEmail, customerRoblox, customerDiscord, customerNotes } = parsed.data
  const name = sanitizeInput(customerName)
  const email = sanitizeInput(customerEmail)
  const roblox = sanitizeInput(customerRoblox)
  const discord = sanitizeInput(customerDiscord)
  const notes = customerNotes ? sanitizeInput(customerNotes) : null

  // Validate items against real DB data
  let serverTotal = 0
  const validatedItems: { fruitId: string; name: string; price: number; priceUSD: number; quantity: number }[] = []
  for (const item of items) {
    const fruit = await prisma.fruit.findUnique({ where: { id: item.fruitId } })
    if (!fruit) return NextResponse.json({ error: `"${item.name}" no encontrada en inventario` }, { status: 400 })
    if (fruit.stock < item.quantity) {
      return NextResponse.json({ error: `Stock insuficiente para "${item.name}". Disponible: ${fruit.stock}` }, { status: 400 })
    }
    serverTotal += fruit.price * item.quantity
    validatedItems.push({
      fruitId: fruit.id,
      name: fruit.name,
      price: fruit.price,
      priceUSD: fruit.priceUSD,
      quantity: item.quantity,
    })
  }

  if (Math.abs(serverTotal - body.total) > 0.01) {
    return NextResponse.json({ error: 'Error de validación: el total no coincide' }, { status: 400 })
  }

  // Idempotency: check for duplicate pending orders in last 2 min
  const duplicate = await prisma.order.findFirst({
    where: {
      customerEmail: email,
      status: 'pending_payment',
      paymentMethod: 'mercadopago',
      createdAt: { gte: new Date(Date.now() - 120000) },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (duplicate) {
    return NextResponse.json({
      error: 'Ya tienes un pedido pendiente. Espera a que se procese.',
      existingOrderId: duplicate.id,
    }, { status: 409 })
  }

  const origin = getOrigin(request)

  // 1. Create order in DB first
  const order = await prisma.order.create({
    data: {
      items: JSON.stringify(validatedItems),
      total: serverTotal,
      totalUSD: validatedItems.reduce((s, i) => s + i.priceUSD * i.quantity, 0),
      status: 'pending_payment',
      paymentMethod: 'mercadopago',
      customerName: name,
      customerEmail: email,
      customerRoblox: roblox,
      customerDiscord: discord,
      customerNotes: notes,
    },
  })

  // 2. Create Mercado Pago preference
  const mpItems = validatedItems.map((item) => ({
    id: item.fruitId,
    title: `${item.name} — Blox Fruit`,
    description: `Fruta física de Blox Fruits`,
    quantity: item.quantity,
    currency_id: 'PEN' as const,
    unit_price: item.price,
  }))

  let result: Awaited<ReturnType<typeof preference.create>>
  try {
    result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${origin}/pagos?success=true&order=${order.id}`,
          failure: `${origin}/stock`,
          pending: `${origin}/pagos?order=${order.id}`,
        },
        external_reference: order.id,
        notification_url: `${origin}/api/webhook/mercadopago`,
        payer: { email },
      },
    })
  } catch (mpError: any) {
    console.error('[MP] Preference creation failed, cleaning up order:', order.id)
    console.error('[MP] Error:', mpError.message || mpError)
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    console.error('[MP] Status code: 502')
    console.error('[MP] Payload enviado:', JSON.stringify(mpItems))
    console.error('[MP] Error real:', mpError.message || mpError)
    console.error('[MP] Response:', mpError.cause || mpError.response?.data || 'N/A')
    return NextResponse.json({
      error: 'No se pudo crear la preferencia de pago. Revisa consola para más detalles.',
      detail: process.env.NODE_ENV === 'development' ? (mpError.message || 'Error desconocido') : undefined,
    }, { status: 502 })
  }

  const initPoint = result.init_point || result.sandbox_init_point
  if (!initPoint) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    return NextResponse.json({ error: 'Error de configuración de pago. Contacta al soporte.' }, { status: 500 })
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentId: result.id },
  })

  sendOrderNotification({ ...order, paymentId: result.id }, 'created')

  return NextResponse.json({ url: initPoint, orderId: order.id })
}, {
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  maxBodySize: 1024 * 10, // 10KB
})
