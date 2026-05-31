import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { sanitizeInput } from '@/lib/security'
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
    const { userMessage, botResponse } = body

    const ticket = await prisma.ticket.create({
      data: {
        conversationId: id,
        userMessage: sanitizeInput(userMessage),
        botResponse: sanitizeInput(botResponse),
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear ticket' }, { status: 500 })
  }
}

const VALID_TICKET_STATUSES = ['open', 'resolved', 'closed'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const rateLimited = supportRateLimit(request)
  if (rateLimited) return rateLimited

  const { id } = await params
  try {
    let body: { status?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    if (!body.status || typeof body.status !== 'string' || !VALID_TICKET_STATUSES.includes(body.status as any)) {
      return NextResponse.json({ error: 'Estado inválido. Usa: open, resolved, closed' }, { status: 400 })
    }

    const existing = await prisma.ticket.findUnique({ where: { conversationId: id } })
    if (!existing) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    }

    const data: Record<string, unknown> = { status: body.status }
    if (body.status === 'resolved') {
      data.resolvedAt = new Date()
    }

    const ticket = await prisma.ticket.update({
      where: { conversationId: id },
      data,
    })

    return NextResponse.json(ticket)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar ticket' }, { status: 500 })
  }
}
