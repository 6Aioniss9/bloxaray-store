import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supportRateLimit } from '@/lib/rate-limit'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimited = supportRateLimit(request)
  if (rateLimited) return rateLimited

  const { id } = await params
  try {
    await prisma.conversation.update({
      where: { id },
      data: { unread: false },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al marcar como leído' }, { status: 500 })
  }
}
