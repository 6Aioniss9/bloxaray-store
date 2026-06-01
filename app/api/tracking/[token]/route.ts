import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSecureResponse } from '@/lib/api-security'
import { rateLimitIP } from '@/lib/rate-limit'
import { fruits } from '@/lib/fruits'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const rl = rateLimitIP(request, 10, 60000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en 1 minuto.' }, {
      status: 429,
      headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '60' },
    })
  }

  const { token } = await params

  if (!token || typeof token !== 'string' || token.length < 8) {
    return createSecureResponse({ error: 'Pedido no encontrado' }, 404)
  }

  const fruitMap = new Map(fruits.map((f) => [f.id, f]))

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { trackingToken: token },
        { id: token },
      ],
    },
  })

  if (!order) {
    return createSecureResponse({ error: 'Pedido no encontrado' }, 404)
  }

  let items: { fruitId: string; name: string; image: string; quantity: number }[] = []
  try {
    const rawItems = JSON.parse(order.items) as { fruitId: string; quantity: number }[]
    items = rawItems.map((item) => {
      const fruit = fruitMap.get(item.fruitId)
      return {
        fruitId: item.fruitId,
        name: fruit?.name ?? item.fruitId,
        image: fruit?.image ?? '',
        quantity: item.quantity,
      }
    })
  } catch {
    items = []
  }

  const statusLabels: Record<string, string> = {
    pending_payment: 'Pendiente de pago',
    pending_manual_review: 'Pendiente de revisión',
    paid: 'Pagado',
    preparing_delivery: 'Preparando entrega',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  }

  return createSecureResponse({
    id: order.id,
    trackingToken: order.trackingToken,
    status: order.status,
    statusLabel: statusLabels[order.status] ?? order.status,
    items,
    total: order.total,
    totalUSD: order.totalUSD,
    paymentMethod: order.paymentMethod,
    customerName: order.customerName,
    customerRoblox: order.customerRoblox,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt,
  })
}
