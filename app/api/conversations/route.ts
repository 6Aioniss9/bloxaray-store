import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { sanitizeInput } from '@/lib/security'
import { supportRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const guard = await requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { messages: true, ticket: true },
    })
    return NextResponse.json(conversations)
  } catch {
    return NextResponse.json({ error: 'Error al obtener conversaciones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const rateLimited = supportRateLimit(request)
  if (rateLimited) return rateLimited

  try {
    let body: { id?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }
    if (body.id !== undefined && typeof body.id !== 'string') {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    const conv = await prisma.conversation.create({
      data: {
        id: body.id ? sanitizeInput(body.id) : crypto.randomUUID(),
      },
      include: { messages: true, ticket: true },
    })
    return NextResponse.json(conv, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear conversación' }, { status: 500 })
  }
}
