import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const fruit = await prisma.fruit.findUnique({ where: { id } })
      if (!fruit) return NextResponse.json({ error: 'Fruta no encontrada' }, { status: 404 })
      return NextResponse.json(fruit)
    }

    const fruits = await prisma.fruit.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(fruits)
  } catch {
    return NextResponse.json({ error: 'Error al obtener frutas' }, { status: 500 })
  }
}
