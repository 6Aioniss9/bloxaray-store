import { NextResponse } from 'next/server'
import { getPayment } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const orderId = searchParams.get('orderId')

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: 'Se requiere paymentId u orderId' }, { status: 400 })
    }

    let order = null

    if (orderId) {
      order = await prisma.order.findUnique({ where: { id: orderId } })
    }

    if (!order && paymentId) {
      const orders = await prisma.order.findMany({
        where: { paymentId },
        take: 1,
      })
      order = orders[0] || null
    }

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Always check real status from Mercado Pago if we have a paymentId
    let mpStatus: string | null = null
    const pid = paymentId || order.paymentId
    if (pid) {
      try {
        const pago = await getPayment().get({ id: pid })
        mpStatus = pago.status ?? null

        // Auto-recover: if MP says approved but DB says pending
        if (mpStatus === 'approved' && order.status === 'pending_payment') {
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

          order = await prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid', paymentId: pid },
          })
        }
      } catch (e) {
        console.error('[Status] Error querying MP:', e)
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        totalUSD: order.totalUSD,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerRoblox: order.customerRoblox,
        customerDiscord: order.customerDiscord,
        items: JSON.parse(order.items),
        paymentId: order.paymentId,
        createdAt: order.createdAt,
      },
      mpStatus,
    })
  } catch (error) {
    console.error('[Status] Error:', error)
    return NextResponse.json({ error: 'Error al consultar estado' }, { status: 500 })
  }
}
