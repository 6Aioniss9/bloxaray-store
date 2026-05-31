import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supportRateLimit } from '@/lib/rate-limit'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimited = supportRateLimit(request)
  if (rateLimited) return rateLimited

  const { id } = await params
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { timestamp: 'asc' } }, ticket: true },
    })
    if (!conv) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }
    return NextResponse.json(conv)
  } catch {
    return NextResponse.json({ error: 'Error al obtener conversación' }, { status: 500 })
  }
}
