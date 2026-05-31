import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, sanitizeMessage } from '@/lib/security'
import { supportRateLimit } from '@/lib/rate-limit'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimited = supportRateLimit(request)
  if (rateLimited) return rateLimited

  const { id } = await params
  try {
    const body = await request.json()
    const { role, type, content, audioUrl, fileName } = body

    const conv = await prisma.conversation.findUnique({ where: { id } })
    if (!conv) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }

    const msg = await prisma.message.create({
      data: {
        conversationId: id,
        role: sanitizeInput(role),
        type: sanitizeInput(type ?? 'text'),
        content: sanitizeMessage(content),
        audioUrl: audioUrl ?? null,
        fileName: fileName ? sanitizeInput(fileName) : null,
      },
    })

    return NextResponse.json(msg, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}
