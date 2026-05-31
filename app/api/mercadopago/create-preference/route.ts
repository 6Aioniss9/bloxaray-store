import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security'
import { sendOrderNotification } from '@/lib/discord-webhook'
import { z } from 'zod'

const ItemSchema = z.object({
  fruitId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(99),
})

const CreatePreferenceSchema = z.object({
  items: z.array(ItemSchema).min(1).max(20),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().max(200),
  customerRoblox: z.string().min(1).max(100),
  customerDiscord: z.string().min(1).max(100),
  customerNotes: z.string().max(500).optional().nullable(),
})

function getOrigin(request: Request): string {
  return (
    request.headers.get('origin') ??
    request.headers.get('referer')?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'
  )
}

function getMpClient() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurado')
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 10000 } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = CreatePreferenceSchema.safeParse(body)
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

    const fruitIds = items.map((i) => i.fruitId)
    const dbFruits = await prisma.fruit.findMany({ where: { id: { in: fruitIds } } })

    if (dbFruits.length !== fruitIds.length) {
      return NextResponse.json({ error: 'Una o más frutas no existen en el inventario' }, { status: 400 })
    }

    const fruitMap = new Map(dbFruits.map((f) => [f.id, f]))
    let serverTotal = 0
    let serverTotalUSD = 0
    const validatedItems: { fruitId: string; name: string; price: number; priceUSD: number; quantity: number }[] = []

    for (const item of items) {
      const fruit = fruitMap.get(item.fruitId)!
      if (fruit.stock < item.quantity) {
        return NextResponse.json({
          error: `Stock insuficiente para "${fruit.name}". Disponible: ${fruit.stock}`,
        }, { status: 400 })
      }
      serverTotal += fruit.price * item.quantity
      serverTotalUSD += fruit.priceUSD * item.quantity
      validatedItems.push({
        fruitId: fruit.id, name: fruit.name, price: fruit.price,
        priceUSD: fruit.priceUSD, quantity: item.quantity,
      })
    }

    const duplicate = await prisma.order.findFirst({
      where: {
        customerEmail: email, status: 'pending_payment',
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

    const order = await prisma.order.create({
      data: {
        items: JSON.stringify(validatedItems), total: serverTotal, totalUSD: serverTotalUSD,
        status: 'pending_payment', paymentMethod: 'mercadopago',
        customerName: name, customerEmail: email,
        customerRoblox: roblox, customerDiscord: discord, customerNotes: notes,
      },
    })

    const mpItems = validatedItems.map((item) => ({
      id: item.fruitId,
      title: `${item.name} — Blox Fruit`,
      description: 'Fruta física de Blox Fruits',
      quantity: item.quantity,
      currency_id: 'PEN' as const,
      unit_price: item.price,
    }))

    const mpClient = getMpClient()
    const preferenceAPI = new Preference(mpClient)

    let result
    try {
      result = await preferenceAPI.create({
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
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
      return NextResponse.json({ error: 'No se pudo crear la preferencia de pago.' }, { status: 502 })
    }

    const initPoint = result.init_point || result.sandbox_init_point
    if (!initPoint) {
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
      return NextResponse.json({ error: 'Error de configuración de pago.' }, { status: 500 })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: result.id },
    })

    sendOrderNotification({ ...order, paymentId: result.id }, 'created').catch(() => {})

    return NextResponse.json({ url: initPoint, orderId: order.id })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Error desconocido'
    if (process.env.NODE_ENV !== 'production') console.error('[API] Error:', errMsg)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
