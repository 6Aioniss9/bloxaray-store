import { NextResponse } from 'next/server'
import { rateLimitIP } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { allowed } = rateLimitIP(request, 5, 60000)
    if (!allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en 1 minuto.' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const orderId = formData.get('orderId') as string | null

    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    if (!orderId) return NextResponse.json({ error: 'ID de pedido requerido' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede superar 5MB' }, { status: 400 })
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa PNG, JPG, WebP o PDF' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    await prisma.order.update({
      where: { id: orderId },
      data: { receiptUrl: base64 },
    })

    return NextResponse.json({ success: true, message: 'Comprobante subido correctamente' })
  } catch (error) {
    console.error('Error uploading receipt:', error)
    return NextResponse.json({ error: 'Error al subir el comprobante' }, { status: 500 })
  }
}
