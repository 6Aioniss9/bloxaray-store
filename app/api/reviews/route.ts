import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        handle: true,
        rating: true,
        text: true,
        createdAt: true,
      },
    })
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Error al obtener reseñas' }, { status: 500 })
  }
}
