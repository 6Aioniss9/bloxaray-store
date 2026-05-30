import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { status } = body

    const data: Record<string, unknown> = { status }
    if (status === 'resolved') {
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
