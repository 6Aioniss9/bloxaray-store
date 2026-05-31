import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendOrderNotification } from '@/lib/discord-webhook'
import { webhookRateLimit } from '@/lib/rate-limit'

const MP_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

function verifyMPSignature(request: NextRequest, dataId: string): boolean {
  if (!MP_WEBHOOK_SECRET) {
    console.error('[WEBHOOK] MERCADO_PAGO_WEBHOOK_SECRET not set — rejecting all webhooks')
    return false
  }

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')

  if (!xSignature || !xRequestId) {
    console.warn('[WEBHOOK] Missing x-signature or x-request-id headers')
    return false
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => part.split('=') as [string, string])
  )
  const ts = parts['ts']
  const v1 = parts['v1']

  if (!ts || !v1) {
    console.warn('[WEBHOOK] Malformed x-signature header')
    return false
  }

  const tsNum = parseInt(ts, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - tsNum) > 300) {
    console.warn('[WEBHOOK] Webhook timestamp too old — possible replay attack')
    return false
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto
    .createHmac('sha256', MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
}

async function fetchPaymentFromMP(paymentId: string) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN not set')
  }

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`MP API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function POST(request: NextRequest) {
  const rateLimited = webhookRateLimit(request)
  if (rateLimited) return rateLimited

  try {
    const rawBody = await request.text()

    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const type = body?.type as string
    const dataId = (body?.data as Record<string, unknown>)?.id as string

    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (!verifyMPSignature(request, dataId)) {
      console.error('[WEBHOOK] Invalid signature — request rejected')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payment = await fetchPaymentFromMP(dataId)

    const externalRef = payment?.external_reference as string | undefined
    const status = payment?.status as string | undefined
    const amount = payment?.transaction_amount as number | undefined
    const currency = payment?.currency_id as string | undefined

    if (!externalRef) {
      console.warn('[WEBHOOK] Payment has no external_reference', { dataId })
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (currency && currency !== 'PEN') {
      console.error('[WEBHOOK] Unexpected currency:', currency)
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: externalRef },
    })

    if (!order) {
      console.warn('[WEBHOOK] Order not found:', externalRef)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (order.mpPaymentId && order.mpPaymentId !== dataId) {
      console.warn('[WEBHOOK] Order already linked to different payment:', order.mpPaymentId)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (order.status === 'paid' || order.status === 'delivered') {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (amount !== undefined && Math.abs(amount - order.total) > 0.01) {
      console.error('[WEBHOOK] Amount mismatch — possible fraud', {
        expected: order.total,
        received: amount,
        orderId: externalRef,
      })
      await prisma.order.update({
        where: { id: externalRef },
        data: { status: 'pending_manual_review', mpPaymentId: dataId },
      })
      return NextResponse.json({ received: true }, { status: 200 })
    }

    let newStatus: string = order.status
    switch (status) {
      case 'approved':
        newStatus = 'paid'
        break
      case 'rejected':
      case 'cancelled':
        newStatus = 'cancelled'
        break
      case 'refunded':
        newStatus = 'refunded'
        break
      case 'in_process':
      case 'pending':
        newStatus = 'pending_payment'
        break
      default:
        console.warn('[WEBHOOK] Unknown MP status:', status)
    }

    if (newStatus === 'paid' && order.status !== 'paid') {
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
    }

    const updated = await prisma.order.update({
      where: { id: externalRef },
      data: {
        status: newStatus,
        mpPaymentId: dataId,
        paymentId: dataId,
        paidAt: newStatus === 'paid' ? new Date() : undefined,
      },
    })

    console.info('[WEBHOOK] Order updated', { orderId: externalRef, status: newStatus })
    sendOrderNotification(updated as any, newStatus === 'paid' ? 'paid' : 'updated')

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[WEBHOOK] Unhandled error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
