import { NextResponse } from 'next/server'
import { payment as mpPayment } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'
import { WebhookSignatureValidator } from 'mercadopago'
import { createSafeHandler } from '@/lib/api-security'
import { sendOrderNotification } from '@/lib/discord-webhook'

function validateSignature(request: Request, topic: string, id: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) {
    return true
  }

  try {
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id') ?? ''

    if (!xSignature) {
      console.error('[Webhook] Missing X-Signature header')
      return false
    }

    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId: id,
      secret,
    })
    return true
  } catch (err) {
    console.error('[Webhook] Invalid signature:', err)
    return false
  }
}

async function processPayment(paymentId: string) {
  console.log('[Webhook] Processing payment:', paymentId)

  const pago = await mpPayment.get({ id: paymentId })
  console.log('[Webhook] Payment status:', pago.status, '| ID:', paymentId)

  if (pago.status !== 'approved') return

  // Try external_reference first
  const orderIdFromRef = pago.external_reference || pago.metadata?.order_id

  let order = null
  if (orderIdFromRef) {
    order = await prisma.order.findUnique({ where: { id: orderIdFromRef } })
  }

  // Fallback: find by paymentId
  if (!order) {
    order = await prisma.order.findFirst({ where: { paymentId } })
  }

  if (!order) {
    console.log('[Webhook] No order found for payment:', paymentId)
    return
  }

  if (order.status === 'paid') {
    console.log('[Webhook] Order already paid:', order.id)
    return
  }

  if (order.status !== 'pending_payment') {
    console.log('[Webhook] Order not payable:', order.id, order.status)
    return
  }

  // Decrement stock
  const items = JSON.parse(order.items) as { fruitId: string; quantity: number }[]
  for (const item of items) {
    const fruit = await prisma.fruit.findUnique({ where: { id: item.fruitId } })
    if (fruit && fruit.stock >= item.quantity) {
      await prisma.fruit.update({
        where: { id: item.fruitId },
        data: { stock: { decrement: item.quantity } },
      })
    }
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'paid', paymentId },
  })

  console.log('[Webhook] Order paid successfully:', order.id)
  sendOrderNotification(updated, 'paid')
}

export const POST = createSafeHandler(async (request: Request) => {
  const url = new URL(request.url)
  const topic = url.searchParams.get('topic') ?? ''
  const id = url.searchParams.get('id') ?? ''

  if (topic && id) {
    if (!validateSignature(request, topic, id)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    if (topic === 'payment') {
      await processPayment(id)
    }
    return NextResponse.json({ received: true })
  }

  // Fallback for JSON body webhook format
  const raw = await request.text().catch(() => '')
  if (raw) {
    try {
      const body = JSON.parse(raw)
      const paymentId = body.data?.id || body.id
      if (paymentId) {
        await processPayment(String(paymentId))
      }
    } catch {
      // ignore parse errors
    }
  }

  return NextResponse.json({ received: true })
}, {
  rateLimit: false,
  requireJson: false,
})
