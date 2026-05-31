import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { rateLimitIP } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'receipts')

export async function POST(request: Request) {
  try {
    const { allowed } = rateLimitIP(request, 5, 60000)
    if (!allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en 1 minuto.' }, { status: 429 })
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type debe ser multipart/form-data' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const orderId = formData.get('orderId') as string | null

    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    if (!orderId || typeof orderId !== 'string') return NextResponse.json({ error: 'ID de pedido requerido' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede superar 5MB' }, { status: 400 })
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa PNG, JPG, WebP o PDF' }, { status: 400 })
    }

    // Save file to disk
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    const ext = file.type === 'application/pdf' ? '.pdf' : file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg'
    const fileName = `${randomUUID()}${ext}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    const bytes = await file.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(bytes))

    const receiptUrl = `/uploads/receipts/${fileName}`

    await prisma.order.update({
      where: { id: orderId },
      data: { receiptUrl },
    })

    return NextResponse.json({ success: true, message: 'Comprobante subido correctamente', url: receiptUrl })
  } catch (error) {
    console.error('Error uploading receipt:', error)
    return NextResponse.json({ error: 'Error al subir el comprobante' }, { status: 500 })
  }
}
