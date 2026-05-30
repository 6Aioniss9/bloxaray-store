import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
  try {
    const body = await request.json()
    const conv = await prisma.conversation.create({
      data: {
        id: body.id ?? crypto.randomUUID(),
      },
      include: { messages: true, ticket: true },
    })
    return NextResponse.json(conv, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear conversación' }, { status: 500 })
  }
}
